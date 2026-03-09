// src/search/detail/components/DetailHeader.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicroscope, faCheckCircle, faExclamationTriangle, IconDefinition } from '@fortawesome/free-solid-svg-icons'; // 添加图标
import styles from './DetailHeader.module.css';
import { SpeciesDetailData } from '../types'; // 引入类型

interface DetailHeaderProps {
  chineseName: string;
  scientificName: string;
  authorship: string;
  status: SpeciesDetailData['status']; // 使用导入的类型
  statusText: string;
  icon?: IconDefinition; // 允许传入自定义图标
}

/**
 * 物种详情页的头部组件
 */
const DetailHeader: React.FC<DetailHeaderProps> = ({
  chineseName,
  scientificName,
  authorship,
  status,
  statusText,
  icon = faMicroscope // 默认图标
}) => {

  // 根据状态选择状态徽章的样式和图标
  const getStatusInfo = () => {
    switch (status) {
      case 'confirmed':
        return { className: styles.statusConfirmed, icon: faCheckCircle };
      case 'pending':
        return { className: styles.statusPending, icon: faExclamationTriangle };
      default:
        return { className: styles.statusUnknown, icon: faCheckCircle }; // 可以为未知状态定义样式
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <header className={styles.detailHeader}>
      {/* 左侧图标容器 */}
      <div className={styles.headerIconContainer}>
        <FontAwesomeIcon icon={icon} />
      </div>
      {/* 主要信息区域 */}
      <div className={styles.headerMainInfo}>
        <h1>
          {chineseName}
          {/* 状态徽章 */}
          <span className={`${styles.statusBadge} ${statusInfo.className}`}>
            <FontAwesomeIcon icon={statusInfo.icon} /> {statusText}
          </span>
        </h1>
        {/* 学名及命名人 */}
        <p className={styles.scientificNameDetail} title={`学名及命名人信息: ${scientificName} ${authorship}`}>
          <i>{scientificName}</i> {authorship}
        </p>
      </div>
      {/* 可选的操作按钮区域 (如果需要) */}
      {/* <div className={styles.headerActions}>
        <button className={styles.actionButton}>
          <FontAwesomeIcon icon={faPencilAlt} /> 编辑
        </button>
      </div> */}
    </header>
  );
};

export default DetailHeader;