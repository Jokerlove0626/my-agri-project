// src/chat/types/index.ts

/**
 * 表示聊天消息的类型
 */
export type MessageType = 'user' | 'ai';

/**
 * 单条聊天消息的结构
 */
export interface ChatMessage {
  id: string; // 消息唯一标识
  type: MessageType; // 消息类型：用户或 AI
  content: string; // 消息内容 (可以是纯文本或 HTML)
  thinkingSteps?: string[]; // AI 思考步骤 (可选)
  isThinking?: boolean; // AI 是否仍在思考 (可选)
  attachments?: Attachment[]; // 消息附件 (可选)
  timestamp: number; // 消息时间戳
}

/** 
 * 附件的结构
 */
export interface Attachment {
  id: string; // 附件唯一ID
  type: 'image' | 'file'; // 附件类型
  name: string; // 文件名
  url: string; // 文件或图片的 URL (可能是 data URL 或服务器 URL)
  file?: File; // 原始文件对象 (可选, 用于上传)
}

/**
 * 上传文件预览的结构
 */
export interface FilePreview extends Attachment {
  elementId: string; // 预览 DOM 元素的 ID (用于移除)
}

/**
 * 历史记录项
 */
export interface HistoryItemData {
    id: string;
    title: string;
}

/**
 * 历史记录分组
 */
export interface HistoryGroupData {
    timeframe: string;
    items: HistoryItemData[];
}