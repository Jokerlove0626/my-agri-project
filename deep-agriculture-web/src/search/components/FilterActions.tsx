// src/search/components/FilterActions.tsx
"use client";

import React from 'react';
import styles from './FilterActions.module.css';

// 定义 Props 类型
interface FilterActionsProps {
    onReset: () => void;  // 清空筛选的回调
    onApply: () => void;  // 应用筛选的回调
}

/**
 * 筛选操作按钮组件 (清空、应用)
 */
const FilterActions: React.FC<FilterActionsProps> = ({ onReset, onApply }) => {
  const handleReset = () => {
    console.log('清空筛选条件按钮点击');
    onReset(); // 调用父组件传递的回调
  };

  const handleApply = () => {
    console.log('应用筛选条件按钮点击');
    onApply(); // 调用父组件传递的回调
  };

  return (
    <div className={styles.filterActions}>
      <button className={styles.resetButton} onClick={handleReset}>
        清空筛选
      </button>
      <button className={styles.applyButton} onClick={handleApply}>
        应用筛选
      </button>
    </div>
  );
};

export default FilterActions;