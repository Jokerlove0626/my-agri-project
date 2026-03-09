// src/search/detail/components/InfoSection.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import styles from './InfoSection.module.css';

interface InfoSectionProps {
  title: string;            // Section 标题
  icon: IconDefinition;     // Font Awesome 图标对象
  children: React.ReactNode; // Section 内容
  className?: string;       // 允许传入额外的 CSS 类 (例如 sticky-card)
}

/**
 * 详情页信息区块（卡片）组件
 * 提供统一的标题、图标和卡片样式
 */
const InfoSection: React.FC<InfoSectionProps> = ({ title, icon, children, className = '' }) => {
  return (
    // 应用基础卡片样式和任何传入的额外样式
    <section className={`${styles.infoSection} ${className}`}>
      {/* Section 标题 */}
      <h2 className={styles.sectionTitle}>
        {/*
         * 图标：
         * 移除了 styles.iconGradient 类，因为该类用于文本渐变，
         * 会导致 SVG 图标变透明而无法显示。
         * 图标颜色将默认继承 h2 的颜色 (var(--primary-blue)) 或通过 CSS 单独设置。
        */}
        <FontAwesomeIcon icon={icon} />
        {title}
      </h2>
      {/* Section 内容区域 */}
      <div className={styles.sectionContent}>
        {children}
      </div>
    </section>
  );
};

export default InfoSection;