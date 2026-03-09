// src/search/components/FilterSidebar.tsx
"use client";

import React, { useState } from 'react'; // 引入 useState
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import styles from './FilterSidebar.module.css';
import SearchBox from './SearchBox';
import FilterGroup from './FilterGroup';
import FilterActions from './FilterActions';
// 引入 API 请求参数类型
import type { SearchParams } from '@/services/searchApi';

// 定义 Props 类型，添加搜索触发回调
interface FilterSidebarProps {
  onSearchTrigger: (params: Omit<SearchParams, 'page' | 'pageSize'>) => void; // 触发搜索的回调，传递过滤参数
}

/**
 * 左侧筛选侧边栏组件
 */
const FilterSidebar: React.FC<FilterSidebarProps> = ({ onSearchTrigger }) => {

    // --- 状态管理 ---
    // 搜索关键词状态（由 SearchBox 内部管理并触发搜索）
    // const [searchQuery, setSearchQuery] = useState(''); // 也可以提升到这里管理

    // 筛选条件状态 (简化示例，实际应用需要更复杂的结构)
    const [filters, setFilters] = useState<Omit<SearchParams, 'query' | 'page' | 'pageSize'>>({
        type: undefined,
        classification: undefined,
        status: undefined,
        taxonomicLevel: undefined,
        continent: undefined,
        country: undefined,
        province: undefined,
        hostName: undefined,
        hostType: undefined,
        refType: undefined,
        pubYear: undefined,
    });

    // 处理筛选条件变化的函数 (示例)
    const handleFilterChange = (filterName: keyof typeof filters, value: string | number | undefined) => {
        // 如果值为空字符串，则视为 undefined
        const effectiveValue = (typeof value === 'string' && value.trim() === '') ? undefined : value;
        setFilters(prev => ({ ...prev, [filterName]: effectiveValue }));
        console.log('筛选条件变化:', filterName, effectiveValue);
    };

    // 处理 "应用筛选" 按钮点击
    const handleApplyFilters = () => {
        console.log('应用筛选:', filters);
        // 触发搜索，传递当前的筛选条件 (不包含 query，query 由 SearchBox 触发)
        onSearchTrigger(filters);
    };

    // 处理 "清空筛选" 按钮点击
    const handleResetFilters = () => {
        console.log('清空筛选');
        const resetFilters: typeof filters = {}; // 创建一个空对象或所有值为 undefined 的对象
         Object.keys(filters).forEach(key => {
            (resetFilters as any)[key] = undefined;
             // 清空对应的 input/select 控件的值
             const element = document.getElementById(key) as HTMLInputElement | HTMLSelectElement;
             if (element) {
                 element.value = '';
             }
         });
        setFilters(resetFilters);
        // 清空筛选后是否立即触发搜索？取决于产品需求，这里不清空后立即搜
        // onSearchTrigger(resetFilters);
    };

    // 处理 SearchBox 触发的搜索
     const handleSearchBoxSearch = (query: string) => {
         // 当 SearchBox 触发时，我们结合当前筛选条件一起触发搜索
         onSearchTrigger({ ...filters, query }); // 将 query 合并到当前 filters 中
     };

  return (
    <aside className={styles.filterSidebar}>
      {/* 搜索框，传递 handleSearchBoxSearch 回调 */}
      <SearchBox onSearch={handleSearchBoxSearch} />

      {/* 筛选条件标题 */}
      <h3 className={styles.filterTitle}>
        <FontAwesomeIcon icon={faFilter} className={styles.filterIcon} />
        筛选条件
      </h3>

      {/* 物种信息筛选组 */}
      <FilterGroup title="物种信息" defaultOpen={true}>
        {/* 给每个 input/select 添加 id 和 onChange 事件 */}
        <div className="filter-item"> {/* 使用简单类名 */}
          <label htmlFor="classification">分类:</label>
          <select
            id="classification"
            className="filter-input" // 使用简单类名
            value={filters.classification || ''}
            onChange={(e) => handleFilterChange('classification', e.target.value)}
          >
            <option value="">所有分类</option>
            <option value="昆虫纲">昆虫纲</option>
            <option value="线虫动物门">线虫动物门</option>
            <option value="真菌界">真菌界</option>
            {/* ... 其他选项 ... */}
          </select>
        </div>
        <div className="filter-item">
          <label htmlFor="status">确认状态:</label>
          <select
            id="status"
            className="filter-input"
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">所有状态</option>
            <option value="已确认">已确认</option>
            <option value="待审核">待审核</option>
            <option value="有疑问">有疑问</option>
          </select>
        </div>
         <div className="filter-item">
             <label htmlFor="taxonomicLevel">分类层级:</label>
             <select
                id="taxonomicLevel" // ID 与 filter key 一致
                className="filter-input"
                value={filters.taxonomicLevel || ''}
                onChange={(e) => handleFilterChange('taxonomicLevel', e.target.value)}
             >
                <option value="">所有层级</option>
                <option value="种">种</option>
                <option value="属">属</option>
                <option value="科">科</option>
                <option value="目">目</option>
             </select>
         </div>
      </FilterGroup>

      {/* 地理分布筛选组 */}
      <FilterGroup title="地理分布">
         <div className="filter-item">
            <label htmlFor="continent">大洲:</label>
            <input type="text" id="continent" placeholder="如：亚洲" className="filter-input"
                   value={filters.continent || ''}
                   onChange={(e) => handleFilterChange('continent', e.target.value)} />
        </div>
        <div className="filter-item">
            <label htmlFor="country">国家:</label>
            <input type="text" id="country" placeholder="如：中国" className="filter-input"
                   value={filters.country || ''}
                   onChange={(e) => handleFilterChange('country', e.target.value)} />
        </div>
         <div className="filter-item">
            <label htmlFor="province">省份:</label>
            <input type="text" id="province" placeholder="如：江苏" className="filter-input"
                   value={filters.province || ''}
                   onChange={(e) => handleFilterChange('province', e.target.value)} />
        </div>
      </FilterGroup>

      {/* 寄主信息筛选组 */}
      <FilterGroup title="寄主信息">
        <div className="filter-item">
            <label htmlFor="hostName">寄主名称:</label>
            <input type="text" id="hostName" placeholder="输入寄主学名或中文名" className="filter-input"
                   value={filters.hostName || ''}
                   onChange={(e) => handleFilterChange('hostName', e.target.value)}/>
        </div>
         <div className="filter-item">
            <label htmlFor="hostType">寄主类型:</label>
            <select id="hostType" className="filter-input"
                    value={filters.hostType || ''}
                    onChange={(e) => handleFilterChange('hostType', e.target.value)}>
                <option value="">所有类型</option>
                <option value="primary">主要寄主</option>
                <option value="secondary">次要寄主</option>
                <option value="occasional">偶发寄主</option>
            </select>
        </div>
      </FilterGroup>

      {/* 文献信息筛选组 */}
      <FilterGroup title="文献信息">
         <div className="filter-item">
            <label htmlFor="refType">文献类型:</label>
             <select id="refType" className="filter-input"
                     value={filters.refType || ''}
                     onChange={(e) => handleFilterChange('refType', e.target.value)}>
                <option value="">所有类型</option>
                <option value="综述">综述</option>
                <option value="研究报告">研究报告</option>
                <option value="防治">防治</option>
                {/* ... */}
            </select>
        </div>
         <div className="filter-item">
            <label htmlFor="pubYear">发表年份:</label>
            <input type="number" id="pubYear" placeholder="如: 2023" className="filter-input"
                   value={filters.pubYear || ''}
                   onChange={(e) => handleFilterChange('pubYear', e.target.value ? parseInt(e.target.value) : undefined)}/>
        </div>
      </FilterGroup>

      {/* 筛选操作按钮，传递回调 */}
      <FilterActions onReset={handleResetFilters} onApply={handleApplyFilters} />

       {/* 添加一些简单的 CSS 用于 filter-item 和 filter-input */}
       <style jsx global>{`
         .filter-item {
           margin-bottom: 0.8rem;
         }
         .filter-item label {
           display: block;
           margin-bottom: 0.4rem;
           font-size: 0.85rem;
           color: var(--text-secondary, #7f8c9a);
           font-weight: 500;
         }
         .filter-input { /* 应用到 select 和 input */
           width: 100%;
           padding: 0.6rem 0.8rem;
           border: 1px solid var(--border-color-light, #dee2e6);
           border-radius: var(--border-radius-sm, 6px);
           font-size: 0.9rem;
           box-sizing: border-box;
           transition: border-color 0.3s ease, box-shadow 0.3s ease;
           background-color: #fff;
           color: var(--text-color);
         }
         .filter-input:focus {
           border-color: var(--primary-blue, #4a90e2);
           outline: none;
           box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
         }
         .filter-input[type="number"]::-webkit-inner-spin-button,
         .filter-input[type="number"]::-webkit-outer-spin-button {
             -webkit-appearance: none;
             margin: 0;
         }
         .filter-input[type="number"] {
             -moz-appearance: textfield; /* Firefox */
         }
         /* Select 特有的下拉箭头样式 */
         select.filter-input {
             appearance: none;
             background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%237f8c9a'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd' /%3E%3C/svg%3E");
             background-repeat: no-repeat;
             background-position: right 0.7rem center;
             background-size: 1.2em 1.2em;
             padding-right: 2.5rem;
         }
       `}</style>
    </aside>
  );
};

export default FilterSidebar;