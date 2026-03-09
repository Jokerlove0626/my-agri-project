// src/search/components/FilterGroup.tsx
"use client"; // <--- 添加此行，标记为客户端组件（推荐）

import React from 'react';
import styles from './FilterGroup.module.css';

// 定义Props类型
interface FilterGroupProps {
  title: string; // 折叠项标题
  children: React.ReactNode; // 折叠项内容
  defaultOpen?: boolean; // 是否默认展开
}

/**
 * 可折叠的筛选条件分组组件
 * @description 虽然核心交互由<details>元素处理，但将其标记为客户端组件
 *              可以确保在客户端组件树中的一致性，并方便未来添加JS交互。
 */
const FilterGroup: React.FC<FilterGroupProps> = ({ title, children, defaultOpen = false }) => {
  // 如果需要用 JS 控制展开/折叠状态，可以在这里使用 useState
  // const [isOpen, setIsOpen] = React.useState(defaultOpen);
  // const handleToggle = () => setIsOpen(!isOpen);

  return (
    // 如果使用JS控制状态，需要传递 open={isOpen} 并监听 summary 的 onClick={handleToggle}
    <details className={styles.filterGroup} open={defaultOpen}>
      {/* 标题区域，点击可折叠/展开 */}
      <summary className={styles.summary}>
        {title}
      </summary>
      {/* 内容区域 */}
      <div className={styles.content}>
        {children}
      </div>
    </details>
  );
};

export default FilterGroup;