// src/search/components/Pagination.tsx
"use client"; // 标记为客户端组件，因为它包含状态和事件处理

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import styles from './Pagination.module.css';

// 定义 Props 类型接口
interface PaginationProps {
  currentPage: number; // 当前页码 (由父组件控制)
  totalPages: number;  // 总页数 (由父组件控制)
  onPageChange: (page: number) => void; // 页面改变时的回调函数 (由父组件实现)
}

/**
 * 增强版分页组件
 * 功能：
 * - 正确高亮当前页
 * - 智能显示页码按钮 (最多显示5个数字按钮，带省略号)
 * - 支持页码跳转功能
 * - 处理各种边界情况
 */
const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  // --- 跳转功能状态 ---
  // 用于存储跳转输入框的值，初始值为当前页码
  const [jumpPageInput, setJumpPageInput] = useState<string>(String(currentPage));

  // 使用 useEffect 监听外部传入的 currentPage 变化，同步更新输入框的值
  // 这样当父组件通过 API 更新数据导致 currentPage 变化时，输入框也会更新
  useEffect(() => {
    setJumpPageInput(String(currentPage));
  }, [currentPage]);

  // --- 事件处理函数 ---

  /**
   * 处理跳转输入框内容变化，只允许输入数字
   * @param event - 输入框变化事件
   */
  const handleJumpInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^0-9]/g, ''); // 移除非数字字符
    setJumpPageInput(value);
  };

  /**
   * 处理跳转按钮点击或输入框回车事件
   */
  const handleJump = () => {
    const page = parseInt(jumpPageInput, 10); // 将输入值转为整数

    // 验证输入页码是否有效 (是数字、在 1 到 totalPages 之间、且不是当前页)
    if (!isNaN(page) && page >= 1 && page <= totalPages && page !== currentPage) {
      console.log(`[Pagination] 跳转到页面: ${page}`);
      onPageChange(page); // 调用父组件的回调函数切换页面
    } else if (!isNaN(page) && (page < 1 || page > totalPages)) {
      // 如果页码无效 (超出范围)
      console.warn(`[Pagination] 无效的页码: ${page}, 总页数: ${totalPages}`);
      alert(`请输入 1 到 ${totalPages} 之间的有效页码。`);
      setJumpPageInput(String(currentPage)); // 将输入框重置为当前页码
    } else {
      // 如果输入不是有效数字或与当前页相同，也重置输入框
      setJumpPageInput(String(currentPage));
    }
  };

  /**
   * 处理跳转输入框的回车键事件
   * @param event - 键盘事件
   */
  const handleJumpKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleJump(); // 按回车时执行跳转
    }
  };

  // --- 页码渲染逻辑 ---
  const renderPageNumbers = () => {
    const pageNumbers: (number | string)[] = []; // 存储页码或省略号的数组
    const maxPageNumbersToShow = 5; // 最多显示的数字页码按钮数量
    const pageSpread = Math.floor(maxPageNumbersToShow / 2); // 当前页左右分布的数量

    // 1. 总页数较少，直接显示所有页码
    if (totalPages <= maxPageNumbersToShow + 2) { // 例如: <= 7 页时全部显示
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // 2. 总页数较多，需要显示省略号

      // 添加第一页
      pageNumbers.push(1);

      // 计算中间页码的起始点
      // 规则：尽量让 currentPage 居中，同时处理边界情况
      let start = Math.max(2, currentPage - pageSpread);
      let end = Math.min(totalPages - 1, currentPage + pageSpread);

      // 如果 currentPage 靠近开头 (例如 1, 2, 3)
      if (currentPage - pageSpread <= 2) {
        end = 1 + maxPageNumbersToShow -1; // 保证从第2页开始，显示满5个 (1, 2, 3, 4, 5)
      }
      // 如果 currentPage 靠近末尾 (例如 N-2, N-1, N)
      else if (currentPage + pageSpread >= totalPages - 1) {
        start = totalPages - maxPageNumbersToShow; // 保证到倒数第2页结束，显示满5个 (N-4, N-3, N-2, N-1)
      }

      // 添加第一个省略号
      if (start > 2) {
        pageNumbers.push('...');
      }

      // 添加中间的页码数字
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }

      // 添加第二个省略号
      if (end < totalPages - 1) {
        pageNumbers.push('...');
      }

      // 添加最后一页 (如果它没在中间部分显示)
      if (totalPages > 1) { // 确保总页数大于1才添加最后一页
          pageNumbers.push(totalPages);
      }
    }

    // 渲染页码按钮和省略号
    return pageNumbers.map((page, index) => {
      if (typeof page === 'number') {
        return (
          <button
            key={page} // 使用页码作为唯一 key
            onClick={() => onPageChange(page)}
            // **关键：正确应用高亮样式**
            className={currentPage === page ? styles.active : ''}
            // 当前页按钮禁用，防止重复点击
            disabled={currentPage === page}
            aria-label={`第 ${page} 页`} // 提高可访问性
            aria-current={currentPage === page ? 'page' : undefined} // 标记当前页
          >
            {page}
          </button>
        );
      } else {
        // 渲染省略号
        return (
          <span key={`ellipsis-${index}`} className={styles.ellipsis}>
            {page}
          </span>
        );
      }
    });
  };

  // --- 组件渲染 ---

  // 如果总页数小于等于1，则不渲染任何分页内容
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={styles.pagination}>
      {/* 上一页按钮 */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1} // 第一页时禁用
        className={styles.arrowButton}
        aria-label="上一页"
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>

      {/* 页码数字和省略号 */}
      {renderPageNumbers()}

      {/* 下一页按钮 */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages} // 最后一页时禁用
        className={styles.arrowButton}
        aria-label="下一页"
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </button>

      {/* 页码跳转输入区域 (只在总页数足够多时显示) */}
      {totalPages > 5 + 2 && ( // 例如，超过7页时显示跳转
        <div className={styles.jumpContainer}>
          <span className={styles.jumpLabel}>跳至</span>
          <input
            type="number" // 使用 number 类型以调起数字键盘（移动端）
            min="1"
            max={totalPages}
            value={jumpPageInput}
            onChange={handleJumpInputChange}
            onKeyDown={handleJumpKeyDown} // 监听回车
            className={styles.jumpInput}
            aria-label="跳转页码输入框"
          />
          <span className={styles.jumpLabel}>页</span>
          <button onClick={handleJump} className={styles.jumpButton} aria-label="跳转">
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;