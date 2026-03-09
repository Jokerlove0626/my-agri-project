// src/search/components/SearchBox.tsx
"use client";

import React, { useState } from 'react'; // 引入 useState
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import styles from './SearchBox.module.css';

// 定义 Props 类型，添加 onSearch 回调
interface SearchBoxProps {
  onSearch: (query: string) => void; // 当用户点击搜索或按回车时调用
}

/**
 * 搜索框组件
 */
const SearchBox: React.FC<SearchBoxProps> = ({ onSearch }) => {
  // 使用状态管理搜索框的输入值
  const [query, setQuery] = useState('');

  // 处理搜索按钮点击事件
  const handleSearchClick = () => {
    console.log('执行搜索, 关键词:', query.trim());
    onSearch(query.trim()); // 调用父组件传递的 onSearch 函数
  };

  // 处理键盘事件，支持回车搜索
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearchClick();
    }
  };

  // 处理输入框内容变化
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  return (
    <div className={styles.searchBox}>
      <input
        type="text"
        placeholder="搜索物种名、学名、寄主..."
        className={styles.searchInput}
        value={query} // 绑定状态
        onChange={handleChange} // 监听变化
        onKeyDown={handleKeyDown} // 监听回车
      />
      <button className={styles.searchButton} onClick={handleSearchClick}>
        <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
        搜索 {/* 可以加上文字 */}
      </button>
    </div>
  );
};

export default SearchBox;