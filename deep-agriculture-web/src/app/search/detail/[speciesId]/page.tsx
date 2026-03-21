import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faIdCard, faDna, faRulerCombined, faMapMarkedAlt, faTree,
  faExchangeAlt, faShieldAlt, faBookOpen, faBolt, faSitemap, faImages,
  faTags, faCogs, faCheckCircle, faInfoCircle, faAngleRight,
  faHouse, faMicroscope, faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { Alert } from 'antd';

import styles from './page.module.css';
import sectionStyles from '@/search/detail/components/InfoSection.module.css';
import tagStyles from '@/search/detail/components/Tag.module.css';

import DetailHeader from '@/search/detail/components/DetailHeader';
import InfoSection from '@/search/detail/components/InfoSection';
import Tag from '@/search/detail/components/Tag';
import ImageGallery from '@/search/detail/components/ImageGallery';
import { fetchSpeciesDetail } from '@/services/searchApi';

// --- 类型声明 (Next.js 15 规范) ---
interface PageProps {
  params: Promise<{ speciesId: string }>;
}

export default async function SpeciesDetailPage({ params }: PageProps) {
  // ⚡️ 修复 1: 必须 await params (Next.js 15 强制要求)
  const { speciesId } = await params;
  
  let speciesData: any = null;
  let error: string | null = null;

  try {
    speciesData = await fetchSpeciesDetail(speciesId);
  } catch (err: any) {
    error = err.message || "加载失败";
  }

  if (error || !speciesData) {
    return (
      <div className={styles.pageContainer} style={{padding: '2rem'}}>
         <Alert message="档案调用失败" description={error || "未找到该物种"} type="error" showIcon />
         <Link href="/search" className={styles.backLink} style={{marginTop: '1.5rem', display: 'inline-block'}}>
            <FontAwesomeIcon icon={faArrowLeft} /> 返回搜索
         </Link>
      </div>
    );
  }

  // --- 辅助函数 (移入组件内部或保持在外部) ---
  const getHostTagType = (type: string) => type === 'primary' ? 'host-primary' : 'host-secondary';

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageActions}>
        <Link href="/search" className={styles.backLink}>
          <FontAwesomeIcon icon={faArrowLeft} /> 返回搜索结果
        </Link>
      </div>

      <div className={styles.detailContentGrid}>
        {/* ⚡️ 修复 2: 对齐字段名 (chineseName -> title) */}
        <DetailHeader
          title={speciesData.title || speciesData.chineseName} 
          scientificName={speciesData.scientificName}
          authorship={speciesData.authorship || ''}
          status={speciesData.status || 'unknown'}
          statusText={speciesData.statusText || '已入库'}
          icon={faMicroscope}
        />

        <div className={styles.mainInfoColumn}>
          <InfoSection title="基本信息" icon={faIdCard}>
            <dl className={sectionStyles.infoListInline}>
              {/* 使用可选链 ?. 保护，防止数据缺失崩溃 */}
              {speciesData.englishName && <div><dt>英文名称:</dt><dd>{speciesData.englishName}</dd></div>}
              <div><dt>分类单元:</dt><dd>{speciesData.taxonomicUnit || '未知'}</dd></div>
              <div><dt>GUID:</dt><dd style={{fontSize: '10px'}}>{speciesData.id}</dd></div>
            </dl>
            <p>{speciesData.content || speciesData.description || "暂无描述信息"}</p>
          </InfoSection>

          {/* 只有当后端有数据时才渲染模块 */}
          {speciesData.biology && (
            <InfoSection title="生物学特性" icon={faDna}>
              <p>{speciesData.biology.properties}</p>
            </InfoSection>
          )}
        </div>

        <aside className={styles.sideInfoColumn}>
          <InfoSection title="快速概览" icon={faBolt} className={styles.stickyCard}>
            <dl className={styles.quickFactsList}>
              <div>
                <dt><FontAwesomeIcon icon={faCheckCircle} />确认状态:</dt>
                <dd className={styles.statusText}>{speciesData.statusText || '已审核'}</dd>
              </div>
              {/* 分类地位安全渲染 */}
              {speciesData.taxonomy && (
                 <div><dt><FontAwesomeIcon icon={faSitemap} />主要分类:</dt>
                 <dd>{speciesData.taxonomy[1]?.name || '未分类'}</dd></div>
              )}
            </dl>
          </InfoSection>
        </aside>
      </div>
    </div>
  );
}