// src/app/entry/page.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import EntryForm from '@/entry/components/EntryForm'; // 使用 @/ 别名
import styles from '@/entry/styles/EntryForm.module.css'; // 使用 @/ 别名

// 定义页面元数据 (可选)
export const metadata = {
  title: 'DeepForest - 数据录入',
  description: 'DeepForest 系统数据录入与管理页面',
};

const DataEntryPage: React.FC = () => {
  return (
    // 使用 main 标签作为页面主要内容容器
    <main className={styles.entryPage}>
      <h1 className={styles.pageTitle}>
        <FontAwesomeIcon icon={faEdit} />
        数据录入与管理
      </h1>

      {/* 渲染表单组件 */}
      <EntryForm />

    </main>
  );
};

export default DataEntryPage;