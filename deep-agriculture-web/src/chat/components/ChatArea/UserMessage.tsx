// src/chat/components/ChatArea/UserMessage.tsx
import React from 'react';
import type { ChatMessage } from '@/chat/types';
import Icon from '@/chat/components/common/Icon'; // 如果需要在用户消息中显示图标

// 定义 UserMessage 组件 props 类型
interface UserMessageProps {
  message: ChatMessage; // 包含用户消息内容的数据
}

/**
 * 显示来自用户的消息组件
 * @param message - 用户消息对象
 */
const UserMessage: React.FC<UserMessageProps> = ({ message }) => {

    // 渲染附件 (如果存在)
    const renderAttachments = () => (
        <div className="message-attachments">
            {message.attachments?.map((att) => (
                <div key={att.id} className="attachment-item">
                    {att.type === 'image' ? (
                        // 对于用户上传的图片，url 可能是 data URL
                        <img src={att.url} alt={att.name} className="attachment-image" />
                    ) : (
                        <div className="attachment-file">
                            <Icon name="FileText" size={18} className="feather" />
                            <span className="attachment-filename" title={att.name}>{att.name}</span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );


  return (
    <div className="message user-message" id={`message-${message.id}`}>
      {/* 用户消息内容容器 */}
      <div className="message-content-wrapper">
        <div className="message-content">
           {/* 直接渲染用户输入的文本内容 */}
           {/* 使用 dangerouslySetInnerHTML 渲染可能包含简单格式或链接的文本，确保内容安全 */}
           {/* 或者简单地渲染纯文本 */}
           {message.content && (
                <div dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br />') }}></div>
                // 或者 <p>{message.content}</p> 如果不需要 HTML 渲染
           )}

           {/* 渲染附件 */}
           {message.attachments && message.attachments.length > 0 && renderAttachments()}
        </div>
      </div>
       {/* 可以选择性地添加用户头像 */}
       {/* <div className="user-icon-wrapper">...</div> */}
    </div>
  );
};

export default UserMessage;