// src/search/detail/components/Tag.tsx
import React from 'react';
import styles from './Tag.module.css';

// 定义 Tag 类型，需要覆盖所有在 HTML 中使用的类别
type TagType =
  | 'host-primary' | 'host-secondary' | 'host-occasional' // 寄主
  | 'medium-vector' | 'medium-other' // 媒介
  | 'ref-biology' | 'ref-control' | 'ref-distribution' | 'ref-review' | 'ref-book' | 'ref-default'; // 文献

interface TagProps {
  text: string;         // 标签显示的文本
  type: TagType;        // 标签类型，用于确定样式
  tooltip?: string;     // HTML title 属性，用于鼠标悬停提示
}

/**
 * 可复用的标签组件
 */
const Tag: React.FC<TagProps> = ({ text, type, tooltip }) => {

  // 将 type 映射到 CSS Module 类名
  const getTagClassName = (tagType: TagType): string => {
    switch (tagType) {
      case 'host-primary': return styles.hostPrimary;
      case 'host-secondary': return styles.hostSecondary;
      case 'host-occasional': return styles.hostOccasional;
      case 'medium-vector': return styles.mediumVector;
      case 'medium-other': return styles.mediumOther;
      case 'ref-biology': return styles.refBiology;
      case 'ref-control': return styles.refControl;
      case 'ref-distribution': return styles.refDistribution;
      case 'ref-review': return styles.refReview; // 新增：综述
      case 'ref-book': return styles.refBook;   // 新增：专著
      case 'ref-default': return styles.refDefault; // 默认文献标签
      default: return styles.tagDefault; // 可以添加一个默认基础样式
    }
  };

  return (
    <span
      className={`${styles.tagBase} ${getTagClassName(type)}`}
      title={tooltip} // 设置悬停提示
    >
      {text}
    </span>
  );
};

export default Tag;