// src/chat/components/ChatArea/ChatHistory.tsx
import React, { useRef, useEffect } from 'react';
import type { ChatMessage } from '@/chat/types';
import AiMessage from './AiMessage';
import UserMessage from './UserMessage';

// 定义 ChatHistory 组件 props 类型
interface ChatHistoryProps {
  messages: ChatMessage[]; // 聊天消息列表
}

/**
 * 显示聊天消息历史记录的组件
 * @param messages - 包含所有聊天消息的数组
 */
const ChatHistory: React.FC<ChatHistoryProps> = ({ messages }) => {
  // 创建一个 ref 来引用聊天历史记录的容器元素
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  // 使用 useEffect 来在消息列表更新时自动滚动到底部
  useEffect(() => {
    const scrollToBottom = () => {
      if (chatHistoryRef.current) {
        // 使用 requestAnimationFrame 确保在 DOM 更新后执行滚动
        requestAnimationFrame(() => {
            if (chatHistoryRef.current) { // Double check ref existence inside animation frame
                chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
            }
        });
      }
    };
    scrollToBottom();
  }, [messages]); // 依赖项是消息列表，当消息变化时触发滚动

  return (
    <div className="chat-history" ref={chatHistoryRef}>
      {messages.map((msg) => {
        // 根据消息类型渲染不同的组件
        if (msg.type === 'ai') {
          return <AiMessage key={msg.id} message={msg} />;
        } else {
          return <UserMessage key={msg.id} message={msg} />;
        }
      })}
      {/* 当没有消息时可以显示提示 */}
      {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '50px', fontSize: '0.9em' }}>
              开始你的对话吧！
          </div>
      )}
    </div>
  );
};

export default ChatHistory;