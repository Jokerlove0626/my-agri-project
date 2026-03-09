// src/app/search/page.tsx
"use client"; // <-- 标记为客户端组件，因为需要管理状态

import React, { useState, useCallback } from 'react';
// import Header from '@/components/layout/Header'; // 如果不在全局布局中
import FilterSidebar from '@/search/components/FilterSidebar';
import ResultsArea from '@/search/components/ResultsArea';
import styles from './SearchPage.module.css';
// 引入 API 请求参数类型
import type { SearchParams } from '@/services/searchApi';

/**
 * 搜索结果页面 - 负责协调筛选和结果展示
 */
const SearchPage: React.FC = () => {
  // --- 状态管理 ---
  // 将搜索参数状态提升到页面级别
  const [currentSearchParams, setCurrentSearchParams] = useState<Omit<SearchParams, 'page' | 'pageSize'>>({});

  // --- 回调函数 ---
  // 当侧边栏触发搜索时调用此函数
  const handleSearchTrigger = useCallback((params: Omit<SearchParams, 'page' | 'pageSize'>) => {
      console.log("SearchPage: 收到搜索触发事件, 参数:", params);
      // 更新搜索参数状态，这将导致 ResultsArea 重新获取数据
      // 注意：这里我们只更新查询和过滤条件，页码由 ResultsArea 内部管理
      // 如果希望每次新的搜索都回到第一页，可以在这里操作，但通常让 ResultsArea 处理更好
      setCurrentSearchParams(params);
  }, []); // 空依赖，函数本身不会改变

  return (
    <div className={styles.pageContainer}>
       {/* <Header /> */}
       <div className={styles.mainContainer}>
          {/* 左侧筛选栏，传递搜索触发回调 */}
          <FilterSidebar onSearchTrigger={handleSearchTrigger} />

          {/* 右侧结果展示区，传递当前搜索参数 */}
          <ResultsArea searchParams={currentSearchParams} />
       </div>
    </div>
  );
};

export default SearchPage;