// src/chat/components/ChatArea/PreviewArea.tsx
import React from 'react';
import type { FilePreview } from '@/chat/types';
import Icon from '@/chat/components/common/Icon';

// 定义 PreviewItem 组件 props 类型
interface PreviewItemProps {
    item: FilePreview;
    onRemove: (elementId: string) => void;
}

// 单个预览项组件
const PreviewItem: React.FC<PreviewItemProps> = ({ item, onRemove }) => {
    return (
        <div className="preview-item" id={item.elementId}>
            {item.type === 'image' ? (
                <img src={item.url} alt={item.name} title={item.name} />
            ) : (
                <div className="file-preview" title={item.name}>
                    <Icon name="FileText" size={16} className="feather" />
                    <span>{item.name}</span>
                </div>
            )}
            {/* 移除按钮 */}
            <button
                className="remove-preview"
                onClick={() => onRemove(item.elementId)}
                aria-label={`移除 ${item.name}`}
            >
                × {/* 使用 HTML 实体 '×' */}
            </button>
        </div>
    );
};


// 定义 PreviewArea 组件 props 类型
interface PreviewAreaProps {
  previews: FilePreview[]; // 要显示的预览项数组
  onRemovePreview: (elementId: string) => void; // 移除预览项的回调函数
}

/**
 * 输入框上方用于显示待上传文件/图片预览的区域
 * @param previews - 包含文件/图片预览信息的数组
 * @param onRemovePreview - 用户点击移除某个预览项时的回调函数
 */
const PreviewArea: React.FC<PreviewAreaProps> = ({ previews, onRemovePreview }) => {
  // 如果没有预览项，不渲染该区域
  if (previews.length === 0) {
    return null;
  }

  return (
    <div id="preview-area" className="preview-area">
      {previews.map((item) => (
          <PreviewItem key={item.elementId} item={item} onRemove={onRemovePreview} />
      ))}
    </div>
  );
};

export default PreviewArea;