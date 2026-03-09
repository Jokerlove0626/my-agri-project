// src/chat/components/common/Icon.tsx
import React from 'react';
import * as FeatherIcons from 'react-feather';

// 定义 Icon 组件接受的 props 类型
interface IconProps  {
  name: keyof typeof FeatherIcons; // 图标名称，必须是 react-feather 库支持的名称
  size?: number; // 可选，图标大小
  className?: string; // 可选，额外的 CSS 类名
  color?: string; // 可选，图标颜色
  style?: React.CSSProperties; // 可选，额外的内联样式
  // 其他可能的属性...
}

/**
 * Feather 图标的封装组件
 * @param name - Feather图标的名称 (例如 'Send', 'Image')
 * @param props - 其他传递给 Feather 图标的属性 (例如 size, color, className)
 */
const Icon: React.FC<IconProps> = ({ name, ...props }) => {
  // 从 react-feather 库中获取对应的图标组件
  const FeatherIcon = FeatherIcons[name];

  // 如果找不到对应的图标，可以返回 null 或一个默认图标/错误提示
  if (!FeatherIcon) {
    console.warn(`Icon "${name}" not found in react-feather`);
    return null;
  }

  // 渲染找到的 Feather 图标组件，并传入所有其他 props
  return <FeatherIcon {...props} />;
};

export default Icon;