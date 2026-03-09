// src/search/components/ResultsArea.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faListUl, faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { Spin, Alert, Empty } from 'antd';
import styles from './ResultsArea.module.css';
import ResultCard from './ResultCard';
import Pagination from './Pagination';
// ** 1. 导入 API 函数和请求参数类型 **
import { fetchSearchResults, SearchParams } from '@/services/searchApi';
// ** 2. 从 apiTypes 导入响应数据类型 **
import type { SearchResultItemVO, PageVO } from '@/services/apiTypes'; // 导入 VO 类型

// 定义 Props 类型 (保持不变)
interface ResultsAreaProps {
  searchParams: Omit<SearchParams, 'page' | 'pageSize'>;
}

/**
 * 右侧搜索结果展示区域组件
 */
const ResultsArea: React.FC<ResultsAreaProps> = ({ searchParams }) => {
   // --- 状态管理 ---
   // ** 3. 使用导入的 VO 类型更新状态类型 **
   const [resultsData, setResultsData] = useState<PageVO<SearchResultItemVO> | null>(null);
   const [currentPage, setCurrentPage] = useState(1);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [pageSize, setPageSize] = useState(10);

   // --- 数据获取 Effect (保持不变) ---
   useEffect(() => {
       const loadResults = async () => {
           setIsLoading(true);
           setError(null);
           const currentParams: SearchParams = {
               ...searchParams,
               page: currentPage,
               pageSize: pageSize,
           };
           try {
               const data = await fetchSearchResults(currentParams); // fetchSearchResults 返回 PageVO<SearchResultItemVO>
               setResultsData(data);
           } catch (err: any) {
               console.error("搜索结果加载失败:", err);
               setError(err.message || "加载搜索结果时发生未知错误");
               setResultsData(null);
           } finally {
               setIsLoading(false);
           }
       };
       loadResults();
   }, [searchParams, currentPage, pageSize]);

   // 处理分页改变 (保持不变)
   const handlePageChange = (page: number) => {
       if (page !== currentPage) {
           console.log(`切换到页面: ${page}`);
           setCurrentPage(page);
       }
   };

   // --- 渲染逻辑 ---
   const renderResults = () => {
       // ... (加载中、错误状态处理保持不变) ...
        if (isLoading) { /* ... */ }
        if (error) { /* ... */ }

       // 加载成功但无结果
       if (!resultsData || resultsData.records.length === 0) {
           return (
               <Empty description="未找到相关结果，请尝试调整搜索或筛选条件。" />
           );
       }
       // 正常显示结果
       return (
           <>
                {/* 结果卡片网格 */}
                <div className={styles.resultsGrid}>
                    {/* ** 4. map 函数中参数 result 的类型现在是 SearchResultItemVO ** */}
                    {resultsData.records.map((result: SearchResultItemVO) => ( // 显式添加类型注解
                    <ResultCard
                        key={result.id}
                        type={result.type as 'species' | 'document'} // 类型断言可能仍需要
                        // icon={result.icon} // 假设后端不返回图标字符串
                        title={result.title}
                        scientificName={result.scientificName}
                        classification={result.classification}
                        status={result.status}
                        statusType={result.statusType as 'confirmed' | 'pending' | 'default'} // 类型断言
                        author={result.author}
                        description={result.description}
                        tags={result.tags}
                        buttonText={result.type === 'species' ? '查看详情' : '查看文献'}
                        detailLink={result.detailLink}
                    />
                    ))}
                </div>

                {/* 分页控件 (保持不变) */}
                { resultsData.totalPages > 1 && (
                    <Pagination
                        currentPage={resultsData.page}
                        totalPages={resultsData.totalPages}
                        onPageChange={handlePageChange}
                    />
                 ) }
           </>
       );
   };

  return (
    <main className={styles.resultsArea}>
      {/* 结果区域标题 (保持不变) */}
      <h2 className={styles.resultsTitle}>
        <FontAwesomeIcon icon={faListUl} className={styles.resultsIcon} />
        搜索结果
        {!isLoading && !error && resultsData && (
             <span style={{fontSize: '0.9rem', color: 'var(--text-secondary)', marginLeft: 'auto'}}>
                共 {resultsData.total} 条结果，第 {resultsData.page} / {resultsData.totalPages} 页
             </span>
        )}
      </h2>

      {/* 渲染结果区域 */}
      {renderResults()}

    </main>
  );
};

export default ResultsArea;