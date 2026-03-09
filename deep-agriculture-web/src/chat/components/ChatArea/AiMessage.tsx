// src/chat/components/ChatArea/AiMessage.tsx
import React from 'react';
import ThinkingPanel from './ThinkingPanel';
import type { ChatMessage } from '@/chat/types';
import Icon from '@/chat/components/common/Icon';

// 导入 Markdown 渲染和语法高亮相关库
import ReactMarkdown from 'react-markdown';
//@ts-ignore
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// 选择一个你喜欢的高亮主题，例如 vscDarkPlus (VS Code 默认暗色主题)
// 更多主题: https://github.com/react-syntax-highlighter/react-syntax-highlighter/blob/master/AVAILABLE_STYLES_PRISM.md
//@ts-ignore
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm'; // 支持 GFM (表格、删除线等)
import rehypeRaw from 'rehype-raw'; // 支持原始 HTML (如果需要)

// 定义 AiMessage 组件 props 类型
interface AiMessageProps {
  message: ChatMessage; // 包含 AI 消息内容、思考状态和步骤的数据
}

/**
 * 显示来自 AI 的消息组件
 * 使用 react-markdown 和 react-syntax-highlighter 渲染 Markdown 内容
 * @param message - AI 消息对象，包含内容、思考步骤等
 */
const AiMessage: React.FC<AiMessageProps> = ({ message }) => {
  // 检查是否存在思考步骤或正在思考，以决定是否显示思考面板
  const showThinkingPanel = message.isThinking || (message.thinkingSteps && message.thinkingSteps.length > 0);

  // 渲染附件 (如果存在) - 这部分逻辑保持不变
  const renderAttachments = () => (
    <div className="message-attachments">
      {message.attachments?.map((att) => (
        <div key={att.id} className="attachment-item">
          {att.type === 'image' ? (
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
    <div className="message ai-message" id={`message-${message.id}`}>
      {/* AI 头像 */}
      <div className="ai-icon-wrapper">
        <div className="ai-icon">
          <Icon name="Feather" size={16} /> {/* 使用林业相关图标 */}
        </div>
      </div>

      {/* 消息内容容器 */}
      <div className="message-content-wrapper">
        <div className="message-content">
          {/* 条件渲染思考过程面板 */}
          {showThinkingPanel && (
            <ThinkingPanel
              steps={message.thinkingSteps || []}
              isThinking={!!message.isThinking}
            />
          )}

          {/* AI 的最终回答 - 使用 ReactMarkdown 渲染 */}
          {/* 确保 message.content 存在且不是初始占位符 */}
          {message.content && message.content !== '...' && (
            <div className="ai-answer markdown-body"> {/* 添加 markdown-body 类方便统一样式 */}
              <ReactMarkdown
                // remarkPlugins 用于处理 Markdown 文本本身
                remarkPlugins={[remarkGfm]} // 启用 GFM 支持
                // rehypePlugins 用于处理转换后的 HTML (在 remark 处理之后)
                rehypePlugins={[rehypeRaw]} // 启用 HTML 解析 (如果需要)
                components={{
                  // 自定义代码块渲染，使用 react-syntax-highlighter
                  //@ts-ignore
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus} // 应用选择的代码高亮主题
                        language={match[1]}
                        PreTag="div" // 使用 div 作为外层标签
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      // 对于行内代码 (`code`) 或没有指定语言的代码块，使用默认渲染
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                  // 可以自定义其他元素的渲染，例如链接、图片等
                  // a: ({node, ...props}) => <a target="_blank" rel="noopener noreferrer" {...props} />, // 例如：让所有链接在新标签页打开
                  // img: ({node, ...props}) => <img style={{maxWidth: '100%'}} {...props} />, // 例如：限制图片最大宽度
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {/* 如果正在思考且没有最终答案，可以显示一个占位符 */}
          {message.isThinking && message.content === '...' && (
            <div className="ai-answer">正在生成回答...</div>
          )}

          {/* 渲染附件 */}
          {message.attachments && message.attachments.length > 0 && renderAttachments()}
        </div>
      </div>
    </div>
  );
};

export default AiMessage;