// src/chat/components/ChatArea/ThinkingPanel.tsx
import React, { useState, useEffect } from 'react';
import Icon from '@/chat/components/common/Icon';

// 定义 ThinkingPanel 组件 props 类型
interface ThinkingPanelProps {
  steps: string[]; // 思考步骤列表
  isThinking: boolean; // AI 是否仍在思考
  initialExpanded?: boolean; // 初始是否展开 (可选)
}

/**
 * AI 消息中的思考过程展示面板
 * @param steps - AI 思考过程的步骤描述数组
 * @param isThinking - AI 是否还在生成内容或步骤
 * @param initialExpanded - 控制面板初始是否展开
 */
const ThinkingPanel: React.FC<ThinkingPanelProps> = ({ steps, isThinking, initialExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  // 当接收到新步骤时，如果面板是关闭的，可以考虑自动展开第一次
  useEffect(() => {
      // 仅在首次接收到步骤且初始未展开时自动展开
      if (steps.length > 0 && !initialExpanded && !isExpanded && isThinking) {
         setIsExpanded(true); // 暂时注释掉自动展开逻辑，可根据需要启用
      }
      // 当思考完成时，如果面板是展开的，保持展开状态
      // 如果需要思考完成后自动折叠，可以在这里添加逻辑
  }, [steps.length, initialExpanded, isExpanded, isThinking]);


  const togglePanel = () => {
    setIsExpanded(!isExpanded);
  };

  // 根据思考状态显示不同的标题文本
  const statusText = isThinking ? 'AI 正在思考...' : '思考过程';

  return (
    <div className="thinking-process">
      {/* 面板头部，点击可展开/折叠 */}
      <div
        className="thinking-header"
        role="button"
        tabIndex={0} // 使 div 可聚焦并响应键盘事件
        aria-expanded={isExpanded}
        onClick={togglePanel}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') togglePanel(); }} // 响应回车和空格键
      >
        <span className="thinking-status">{statusText}</span>
        <button
          className="toggle-thinking"
          aria-label={isExpanded ? "折叠思考过程" : "展开思考过程"}
          onClick={(e) => { e.stopPropagation(); togglePanel(); }} // 阻止事件冒泡到 header
        >
          <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={16} className="feather" />
        </button>
      </div>

      {/* 思考步骤详情，根据 isExpanded 控制显隐和动画 */}
      <div className={`thinking-details ${isExpanded ? 'expanded' : ''}`} aria-hidden={!isExpanded}>
        {/* 使用 dangerouslySetInnerHTML 需要确保 steps 内容是安全的 */}
        {steps.map((step, index) => (
            // 渲染普通文本，不使用 dangerouslySetInnerHTML 以保证安全
            <p key={index}>{step}</p>
        ))}
        {/* 如果正在思考且没有步骤，可以显示加载状态 */}
        {isThinking && steps.length === 0 && <p>正在分析...</p>}
      </div>
    </div>
  );
};

export default ThinkingPanel;