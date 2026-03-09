// src/chat/components/ChatArea/ChatArea.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import WelcomeScreen from './WelcomeScreen';
import ChatHistory from './ChatHistory';
import InputArea from './InputArea';
import type { ChatMessage, Attachment } from '@/chat/types';
import { fetchChatMessages, sendMessageWithSse } from '@/services/chatApi';
import type { SseEventData, ChatMessageDto } from '@/services/chatApi'; // 引入类型

interface ChatAreaProps {
  chatId: string | null;
  onChatStarted: (newChatId: string) => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({ chatId, onChatStarted }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationStarted, setConversationStarted] = useState(!!chatId);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const currentAiMessageIdRef = useRef<string | null>(null);
  const confirmedChatIdRef = useRef<string | null>(chatId);

  const chatHistoryWrapperRef = useRef<HTMLDivElement>(null);

  // --- Effects ---
  // 加载消息效果
  useEffect(() => {
    confirmedChatIdRef.current = chatId;
    if (chatId) {
      const loadMessages = async () => {
        setIsLoadingMessages(true);
        setConversationStarted(true);
        try {
          const loadedMessages = await fetchChatMessages(chatId);
          setMessages(loadedMessages);
        } catch (error) {
          console.error(`Failed to load messages for chat ${chatId}:`, error);
          setMessages([{
              id: 'error-load', type: 'ai',
              content: `加载消息失败: ${error instanceof Error ? error.message : '未知错误'}`,
              timestamp: Date.now()
          }]);
        } finally {
          setIsLoadingMessages(false);
        }
      };
      loadMessages();
    } else {
      setMessages([]);
      setConversationStarted(false);
      setIsLoadingMessages(false);
    }
  }, [chatId]);
  
  // 自动滚动到底部效果
  useEffect(() => {
    const scrollToBottom = () => {
      if (chatHistoryWrapperRef.current) {
        // 使用 requestAnimationFrame 确保在 DOM 更新后执行滚动
        requestAnimationFrame(() => {
          if (chatHistoryWrapperRef.current) {
            chatHistoryWrapperRef.current.scrollTop = chatHistoryWrapperRef.current.scrollHeight;
          }
        });
      }
    };
    
    scrollToBottom();
  }, [messages]); // 当消息数组变化时触发滚动

  /**
   * 处理从后端接收到的 SSE 事件
   * @param eventData 包含事件类型和负载的对象
   *
   * Bug Fix (第三次尝试): 修复第一条 AI 消息气泡不显示的问题。
   * 问题根源分析: React 状态更新的异步性与 SSE 事件快速到达的时序竞争，
   *              之前的 map 替换逻辑可能因 placeholder 未及时出现在状态快照中而失败，
   *              或者后续的状态更新覆盖了 map 的结果。
   * 新解决方案: 采用更直接的方法处理 final_message 和 error。
   *              不再尝试替换 placeholder，而是：
   *              1. 过滤掉旧的 placeholder 消息（根据 ID）。
   *              2. 将最终的 AI 消息或错误消息直接添加到数组末尾。
   *              这种方法不依赖于 map 操作是否能在正确时机找到 placeholder。
   *              对于 thinking_step 和 content_chunk，仍然使用 map 更新。
   */
  const handleSseEvent = useCallback((eventData: SseEventData) => {
      const targetAiMessageId = currentAiMessageIdRef.current;

      setMessages(prevMessages => {
          // --- 处理 final_message 或 error ---
          if (eventData.type === 'final_message' || eventData.type === 'error') {
              if (!targetAiMessageId) {
                  // 如果是 final 或 error 但没有追踪的 ID，记录警告并返回原状态
                  console.warn(`${eventData.type} event received without target AI message ID. Ignoring.`);
                  return prevMessages;
              }

              console.log(`SSE: ${eventData.type} received for ID ${targetAiMessageId}. Applying final state.`);

              // 1. 过滤掉旧的 placeholder (如果存在)
              const filteredMessages = prevMessages.filter(msg => msg.id !== targetAiMessageId);

              // 2. 创建最终的消息对象
              let finalOrErrorMessageToAdd: ChatMessage;
              if (eventData.type === 'final_message') {
                  const finalMessageDto = eventData.payload as ChatMessageDto;
                  finalOrErrorMessageToAdd = {
                      id: targetAiMessageId, // 使用我们追踪的 ID
                      type: 'ai',
                      content: finalMessageDto.content,
                      attachments: finalMessageDto.attachments?.map(attDto => ({
                            id: attDto.id, type: attDto.type, name: attDto.name, url: attDto.url,
                        } as Attachment)) || undefined,
                      timestamp: finalMessageDto.timestamp,
                      thinkingSteps: finalMessageDto.thinkingSteps,
                      isThinking: false,
                  };
              } else { // eventData.type === 'error'
                  console.error("SSE: error event processed:", eventData.payload.message);
                  finalOrErrorMessageToAdd = {
                      id: targetAiMessageId, // 使用追踪的 ID
                      type: 'ai',
                      content: `抱歉，处理出错：${eventData.payload.message}`,
                      timestamp: Date.now(),
                      isThinking: false,
                  };
              }

              // 3. 重置状态
              currentAiMessageIdRef.current = null;
              setIsSending(false);

              // 4. 返回过滤后的数组加上最终的消息
              return [...filteredMessages, finalOrErrorMessageToAdd];

          }
          // --- 处理 thinking_step 或 content_chunk ---
          else if (eventData.type === 'thinking_step' || eventData.type === 'content_chunk') {
              if (!targetAiMessageId) {
                   console.warn(`${eventData.type} event without target AI message ID.`);
                   return prevMessages; // 没有目标ID，不处理
              }
              // 对于中间步骤，仍然使用 map 更新对应的 placeholder
              let foundAndUpdated = false;
              const updatedMessages = prevMessages.map(msg => {
                  if (msg.id === targetAiMessageId) {
                      foundAndUpdated = true;
                      if (eventData.type === 'thinking_step') {
                           return { ...msg, thinkingSteps: [...(msg.thinkingSteps || []), eventData.payload.step], isThinking: true };
                      } else { // content_chunk
                           return { ...msg, content: (msg.content === '...' || !msg.content) ? eventData.payload.delta : msg.content + eventData.payload.delta, isThinking: true };
                      }
                  }
                  return msg;
              });
              // 添加一个警告，如果 map 没有找到要更新的消息（理论上不应发生，除非状态极度混乱）
              if (!foundAndUpdated) {
                   console.warn(`SSE ${eventData.type} event for ${targetAiMessageId} could not find the message in the current state snapshot.`);
              }
              return updatedMessages;
          }
          // --- 其他事件类型（如 chat_id）或未知类型，不修改消息列表 ---
          else {
               // chat_id 等事件在这里不直接修改 prevMessages
               return prevMessages;
          }
      });

      // 单独处理 chat_id 和全局 error (这些不依赖 targetAiMessageId)
      if (eventData.type === 'chat_id') {
          console.log("SSE: Received chat ID:", eventData.payload.chatId);
          const newChatId = eventData.payload.chatId;
          confirmedChatIdRef.current = newChatId;
          if (!chatId && newChatId) {
               requestAnimationFrame(() => onChatStarted(newChatId));
          }
      } else if (eventData.type === 'error' && !targetAiMessageId) {
           // 收到 error 事件，但没有追踪的 AI 消息 ID，认为是全局错误
           console.error("SSE: Received global error:", eventData.payload.message);
           setMessages(prev => [...prev, {
               id: `error-global-${Date.now()}`, type: 'ai',
               content: `发生错误: ${eventData.payload.message}`, timestamp: Date.now(), isThinking: false,
           }]);
           setIsSending(false); // 重置发送状态
           currentAiMessageIdRef.current = null; // 清空引用
       }

  }, [chatId, onChatStarted]); // 依赖项保持不变

  // handleSendMessage 函数保持不变
  const handleSendMessage = useCallback(async (text: string, files: File[]) => {
    if (isSending) return;
    setIsSending(true);
    setConversationStarted(true);

    const userMessageId = `user-${Date.now()}`;
    let userAttachments: ChatMessage['attachments'] = [];

    if (files.length > 0) {
        userAttachments = await Promise.all(files.map(async (file, index) => {
            const previewUrl = await new Promise<string>(resolve => {
                const reader = new FileReader(); reader.onload = (e) => resolve(e.target?.result as string); reader.readAsDataURL(file);
            });
            return { id: `local-att-${userMessageId}-${index}`, type: file.type.startsWith('image/') ? 'image' : 'file', name: file.name, url: previewUrl };
        }));
    }

    const userMessage: ChatMessage = { id: userMessageId, type: 'user', content: text, attachments: userAttachments, timestamp: Date.now() };

    const aiPlaceholderId = `ai-placeholder-${Date.now()}`;
    currentAiMessageIdRef.current = aiPlaceholderId;

    const aiThinkingMessage: ChatMessage = { id: aiPlaceholderId, type: 'ai', content: '...', isThinking: true, thinkingSteps: [], timestamp: Date.now() + 100 };

    setMessages((prevMessages) => [...prevMessages, userMessage, aiThinkingMessage]);

    try {
      await sendMessageWithSse(text, confirmedChatIdRef.current, files, handleSseEvent);
    } catch (error) {
        console.error("Error calling sendMessageWithSse:", error);
        handleSseEvent({ type: 'error', payload: { message: `发送请求失败: ${error instanceof Error ? error.message : String(error)}` }});
        setIsSending(false);
        currentAiMessageIdRef.current = null;
    }
  }, [isSending, handleSseEvent]);

  const handleSuggestionClick = (prompt: string) => { handleSendMessage(prompt, []); };
  const handleChangePrompt = () => { console.log("Change prompt clicked"); };

  return (
    <main className="chat-area">
      <div className="chat-history-wrapper" ref={chatHistoryWrapperRef}>
          <WelcomeScreen isHidden={conversationStarted} onSuggestionClick={handleSuggestionClick} onChangePrompt={handleChangePrompt} />
          {isLoadingMessages && <div style={{textAlign: 'center', padding: '20px'}}>正在加载消息...</div>}
          {!isLoadingMessages && <ChatHistory messages={messages} />}
      </div>
      <InputArea onSendMessage={handleSendMessage} isSending={isSending} />
    </main>
  );
};

export default ChatArea;