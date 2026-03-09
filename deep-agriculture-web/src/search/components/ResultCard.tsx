// src/search/components/ResultCard.tsx
"use client"; // <--- 添加此行，标记为客户端组件

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition, faLeaf, faBug, faBookOpen, faArrowRight } from '@fortawesome/free-solid-svg-icons';
// 在 Next.js 中，推荐使用 Link 组件进行导航
import Link from 'next/link';
import styles from './ResultCard.module.css';

// 定义卡片状态的类型
type StatusType = 'confirmed' | 'pending' | 'default'; // 可以扩展更多状态

// 定义卡片数据的 Props 接口
interface ResultCardProps {
  type: 'species' | 'document'; // 卡片类型：物种 或 文献
  icon?: IconDefinition; // 自定义图标 (可选)
  title: string;
  scientificName?: string; // 学名 (物种类型特有)
  classification?: string; // 分类 (物种类型特有)
  status?: string; // 状态文字 (如：已确认, 待审核)
  statusType?: StatusType; // 状态类型，用于控制样式
  author?: string; // 作者 (文献类型特有)
  description: string;
  tags: string[]; // 标签数组
  detailLink?: string; // 详情链接 (可选)
  buttonText: string; // 按钮文字
}

/**
 * 搜索结果卡片组件
 * @description 因为包含按钮点击事件 (onClick) 或 Link 导航，需要标记为客户端组件。
 */
const ResultCard: React.FC<ResultCardProps> = ({
  type,
  icon,
  title,
  scientificName,
  classification,
  status,
  statusType = 'default',
  author,
  description,
  tags,
  detailLink = '#', // 默认链接
  buttonText,
}) => {
  // 根据类型选择默认图标
  const defaultIcon = type === 'species' ? faLeaf : faBookOpen;
  const displayIcon = icon || defaultIcon;

  // 根据状态类型获取对应的 CSS 类
  const getStatusClass = (st: StatusType) => {
    switch (st) {
      case 'confirmed':
        return styles.statusConfirmed;
      case 'pending':
        return styles.statusPending;
      default:
        return '';
    }
  };

  // 虽然 Link 组件本身可以处理导航，但如果按钮有其他非导航的点击逻辑，仍需 onClick
  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    console.log(`查看详情/文献: ${title}`);
    // 如果 Link 存在且有效，导航会由 Link 处理
    // 如果 detailLink 是 '#' 或需要执行其他 JS 操作，可以在这里处理
    if (detailLink === '#') {
      event.preventDefault(); // 阻止默认的 '#' 导航
      alert('详情链接未配置或正在开发中！');
    }
    // 其他可能的 JS 逻辑...
  };

  return (
    <article className={styles.resultCard}>
      {/* 卡片顶部图片/图标占位 */}
      <div className={styles.cardImagePlaceholder}>
        <FontAwesomeIcon icon={displayIcon} className={styles.cardIcon} />
      </div>

      {/* 卡片内容区域 */}
      <div className={styles.cardContent}>
        {/* 标题 */}
        <h3 className={styles.cardTitle}>
          {title}
          {scientificName && <span className={styles.scientificName}> ({scientificName})</span>}
        </h3>

        {/* 信息行 */}
        {type === 'species' && classification && (
          <p className={styles.cardInfo}>
            <strong>分类:</strong> {classification}
          </p>
        )}
        {type === 'document' && author && (
           <p className={styles.cardInfo}>
             <strong>作者:</strong> {author}
           </p>
        )}
         {type === 'species' && status && (
           <p className={styles.cardInfo}>
             <strong>状态:</strong> <span className={getStatusClass(statusType)}>{status}</span>
           </p>
         )}
         {type === 'document' && ( // 文献类型显示 "类型：文献"
            <p className={styles.cardInfo}>
                <strong>类型:</strong> 文献
            </p>
         )}

        {/* 描述 */}
        <p className={styles.cardDescription}>{description}</p>

        {/* 标签 */}
        <div className={styles.cardTags}>
          {tags.map((tag, index) => (
            <span key={index} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>

        {/* 操作按钮 - 使用 Next.js Link 组件进行客户端导航 */}
        <Link href={detailLink} passHref legacyBehavior>
          {/* legacyBehavior 和 <a> 标签是为了让样式能正确应用到 Link 上 */}
          {/* 如果样式直接应用在 Link 上有问题，可以使用这种方式 */}
          {/* 也可以尝试直接给 Link 加 className */}
          <a onClick={(e: React.MouseEvent<HTMLAnchorElement>) => handleButtonClick(e as any)} className={styles.detailsButton} style={{textDecoration: 'none'}}>
            {buttonText} <FontAwesomeIcon icon={faArrowRight} className={styles.buttonIcon}/>
          </a>
        </Link>
        {/* 或者，如果不需要 SEO 友好链接，可以只用 button */}
        {/* <button onClick={handleButtonClick} className={styles.detailsButton}>
          {buttonText} <FontAwesomeIcon icon={faArrowRight} className={styles.buttonIcon}/>
        </button> */}
      </div>
    </article>
  );
};

export default ResultCard;