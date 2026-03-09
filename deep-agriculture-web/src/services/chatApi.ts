// src/services/chatApi.ts
import axios from 'axios'; // 保持 axios 导入，用于 fetchChatHistory/fetchChatMessages (或者也切换到 axiosInstance)
import axiosInstance, { API_BASE_URL } from '@/lib/axiosInstance'; // ** 1. 导入共享实例和 BASE_URL 字符串 **
import type { HistoryGroupData, ChatMessage, Attachment } from '@/chat/types';

// --- DTO 和类型定义 (保持不变) ---
export interface ChatMessageDto { /* ... */ id: string; type: 'user' | 'ai'; content: string; thinkingSteps?: string[]; isThinking?: boolean; attachments?: AttachmentDto[]; timestamp: number; }
interface AttachmentDto { id: string; type: 'image' | 'file'; name: string; url: string; mimeType?: string; } // 添加 mimeType
interface HistoryItemDto { id: string; title: string; }
interface HistoryGroupDto { timeframe: string; items: HistoryItemDto[]; }
interface SseChatIdPayload { chatId: string; }
interface SseThinkingStepPayload { step: string; }
interface SseContentChunkPayload { delta: string; }
interface SseErrorPayload { message: string; }
export interface SseEventData { type: 'chat_id' | 'thinking_step' | 'content_chunk' | 'final_message' | 'error' | 'unknown'; payload: any; }

// --- 映射函数 (保持不变) ---
function mapChatMessageDtoToChatMessage(dto: ChatMessageDto): ChatMessage {
    const attachments = dto.attachments?.map(attDto => ({
        id: attDto.id,
        type: attDto.type,
        name: attDto.name,
        url: attDto.url, // 生产环境应是相对或完整 URL
        mimeType: attDto.mimeType,
    } as Attachment));

    return {
        id: dto.id,
        type: dto.type,
        content: dto.content,
        thinkingSteps: dto.thinkingSteps,
        isThinking: dto.isThinking,
        attachments: attachments,
        timestamp: dto.timestamp,
    };
}

// --- API 调用函数 ---

/**
 * 获取聊天历史记录
 */
export const fetchChatHistory = async (): Promise<HistoryGroupData[]> => {
    try {
        // ** 2. 使用共享实例 axiosInstance **
        // 假设后端 /chat/history 直接返回 HistoryGroupDto[] 数组 (没有 BaseResponse 包装)
        // 为了适应拦截器，我们需要让拦截器知道这个特例，或者我们在这里处理原始响应
        // 简单起见，我们先用原始 axios 调用，或者调整拦截器
        // const response = await axiosInstance.get<HistoryGroupDto[]>('/chat/history'); // 如果拦截器智能处理
        // return response;

        // **保持原始 axios 调用，使用导入的 API_BASE_URL**
         const response = await axios.get<HistoryGroupDto[]>(`${API_BASE_URL}/chat/history`);
         if (response.status === 200) {
              return response.data;
         } else {
              throw new Error(`获取历史记录失败: ${response.statusText}`);
         }
    } catch (error) {
        console.error("获取聊天历史记录时出错:", error);
        // 抛出更具体的错误
         if (axios.isAxiosError(error)) {
             throw new Error(`获取历史记录网络错误: ${error.message}`);
         }
        throw error;
    }
};

/**
 * 获取指定聊天的消息列表
 */
export const fetchChatMessages = async (chatId: string): Promise<ChatMessage[]> => {
     try {
         // ** 保持原始 axios 调用，使用导入的 API_BASE_URL **
         const response = await axios.get<ChatMessageDto[]>(`${API_BASE_URL}/chat/${chatId}/messages`);
         if (response.status === 200) {
            return response.data.map(mapChatMessageDtoToChatMessage);
         } else if (response.status === 404) {
             console.warn(`Chat ${chatId} not found.`);
             return [];
         } else {
             throw new Error(`获取消息列表失败: ${response.statusText}`);
         }
     } catch (error) {
         console.error(`获取聊天 ${chatId} 消息时出错:`, error);
         if (axios.isAxiosError(error) && error.response?.status === 404) {
             return [];
         } else if (axios.isAxiosError(error)) {
             throw new Error(`获取消息网络错误: ${error.message}`);
         }
         throw error;
     }
 };


/**
 * 发送消息并处理 SSE 流式响应 (使用 fetch)
 */
export const sendMessageWithSse = async (
    prompt: string,
    chatId: string | null,
    files: File[],
    onSseEvent: (eventData: SseEventData) => void
): Promise<void> => {

    const formData = new FormData();
    formData.append('prompt', prompt);
    if (chatId) {
        formData.append('chatId', chatId);
    }
    files.forEach((file) => {
        formData.append('files', file, file.name);
    });

    try {
        // ** 3. 使用从 axiosInstance 导入的 API_BASE_URL 字符串 **
        const response = await fetch(`${API_BASE_URL}/chat/message`, {
            method: 'POST',
            body: formData,
        });

        // ... (SSE 处理逻辑保持不变) ...
        if (!response.ok) {
             const errorText = await response.text();
             console.error(`发送消息失败: ${response.status} ${response.statusText}`, errorText);
             onSseEvent({ type: 'error', payload: { message: `请求失败: ${response.status} ${errorText || response.statusText}` } });
             return;
        }
        if (!response.body) { throw new Error('Response body is null'); }
        const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
        let buffer = '';
        while (true) {
            const { done, value } = await reader.read();
            if (done) { console.log('SSE stream finished.'); break; }
            buffer += value;
            let eventEndIndex;
            while ((eventEndIndex = buffer.indexOf('\n\n')) !== -1) {
                 const eventBlock = buffer.substring(0, eventEndIndex);
                 buffer = buffer.substring(eventEndIndex + 2);
                 let eventType: SseEventData['type'] = 'unknown';
                 let eventDataJson = '';
                 const lines = eventBlock.split('\n');
                 lines.forEach(line => {
                     if (line.startsWith('event:')) {
                         eventType = line.substring('event:'.length).trim() as SseEventData['type'];
                     } else if (line.startsWith('data:')) {
                         eventDataJson = line.substring('data:'.length).trim();
                     }
                 });
                 if (eventDataJson && eventType !== 'unknown') {
                     try {
                         const payload = JSON.parse(eventDataJson);
                         onSseEvent({ type: eventType, payload });
                     } catch (e) {
                         console.error('解析SSE数据JSON时出错:', eventDataJson, e);
                          onSseEvent({ type: 'error', payload: { message: `无法解析服务器事件数据: ${eventDataJson}` } });
                     }
                 }
            }
        }
    } catch (error) {
        console.error('SSE 连接或处理时出错:', error);
        onSseEvent({ type: 'error', payload: { message: `连接或处理消息时出错: ${error instanceof Error ? error.message : String(error)}` } });
    }
};