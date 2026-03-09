// src/app/search/detail/[speciesId]/page.tsx
import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faIdCard, faDna, faRulerCombined, faMapMarkedAlt, faTree,
  faExchangeAlt, faShieldAlt, faBookOpen, faBolt, faSitemap, faImages,
  faTags, faCogs, faCheckCircle, faInfoCircle, faAngleRight,
  faHouse, faMicroscope, // 确保使用的图标已导入
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { Alert } from 'antd'; // 引入 Alert

import styles from './page.module.css';
import sectionStyles from '@/search/detail/components/InfoSection.module.css';
import tagStyles from '@/search/detail/components/Tag.module.css';

import DetailHeader from '@/search/detail/components/DetailHeader';
import InfoSection from '@/search/detail/components/InfoSection';
import Tag from '@/search/detail/components/Tag';
import ImageGallery from '@/search/detail/components/ImageGallery';
// 引入类型和 API 调用函数
import { SpeciesDetailData } from '@/search/detail/types';
import { fetchSpeciesDetail } from '@/services/searchApi';

// --- Helper Functions (保持不变) ---
function getHostTagType(type: string): 'host-primary' | 'host-secondary' | 'host-occasional' {
    if (type === 'primary') return 'host-primary';
    if (type === 'secondary') return 'host-secondary';
    return 'host-occasional';
}
function getMediumTagType(type: string): 'medium-vector' | 'medium-other' {
    return type === 'Vector' ? 'medium-vector' : 'medium-other';
}
function getReferenceTagType(tag: string): 'ref-review' | 'ref-book' | 'ref-biology' | 'ref-control' | 'ref-distribution' | 'ref-default' {
    if (tag.includes('综述')) return 'ref-review';
    if (tag.includes('专著')) return 'ref-book';
    if (tag.includes('生物学')) return 'ref-biology';
    if (tag.includes('防治')) return 'ref-control';
    if (tag.includes('分布')) return 'ref-distribution';
    return 'ref-default';
}
// --- End Helper Functions ---


// --- The Page Component (使用明确的内联类型) ---
export default async function SpeciesDetailPage({
    params,
    // searchParams // 如果需要，可以添加类型: { [key: string]: string | string[] | undefined }
}: any
    // searchParams?: { [key: string]: string | string[] | undefined };
) {
  const speciesId = params.speciesId; // 现在可以安全地访问
  let speciesData: SpeciesDetailData | null = null;
  let error: string | null = null;

  // --- 数据获取 (保持不变) ---
  try {
    speciesData = await fetchSpeciesDetail(speciesId);
  } catch (err: any) {
    console.error(`获取物种详情失败 (ID: ${speciesId}):`, err);
    error = err.message || "加载物种详情时发生未知错误";
    if (err.message.includes("未找到")) {
        error = `抱歉，我们无法找到 ID 为 "${speciesId}" 的物种信息。`;
    }
  }

  // --- 渲染逻辑 (保持不变) ---

  // 处理加载错误
  if (error) {
    return (
      <div className={styles.pageContainer} style={{padding: '2rem'}}>
         <Alert
            message="加载错误"
            description={error}
            type="error"
            showIcon
            icon={<FontAwesomeIcon icon={faExclamationTriangle} />}
         />
         <Link href="/search" className={styles.backLink} style={{marginTop: '1.5rem', display: 'inline-block'}}>
           <FontAwesomeIcon icon={faArrowLeft} /> 返回搜索页面
         </Link>
      </div>
    );
  }

  // 处理数据为空
  if (!speciesData) {
    return (
      <div className={styles.container}>
        <h2>物种未找到</h2>
        <p>未能加载物种信息。</p>
        <Link href="/search" className={styles.backLink}>
           <FontAwesomeIcon icon={faArrowLeft} /> 返回搜索页面
        </Link>
      </div>
    );
  }

  // --- 成功获取数据，渲染页面内容 ---
  // (JSX 结构保持不变)
  return (
    <div className={styles.pageContainer}>
        <div className={styles.pageActions}>
             <Link href="/search" className={styles.backLink}>
                <FontAwesomeIcon icon={faArrowLeft} /> 返回搜索结果
            </Link>
         </div>

      <div className={styles.detailContentGrid}>
        <DetailHeader
          chineseName={speciesData.chineseName}
          scientificName={speciesData.scientificName}
          authorship={speciesData.authorship || ''}
          status={speciesData.status || 'unknown'}
          statusText={speciesData.statusText || '未知'}
          icon={faMicroscope}
        />

        <div className={styles.mainInfoColumn}>
          <InfoSection title="基本信息" icon={faIdCard}>
             <dl className={`${sectionStyles.infoListInline}`}>
              {speciesData.englishName && <div><dt>英文名称:</dt><dd>{speciesData.englishName}</dd></div>}
              {speciesData.englishAbbr && <div><dt>英文缩写:</dt><dd>{speciesData.englishAbbr}</dd></div>}
              {speciesData.taxonomicUnit && <div><dt>分类单元:</dt><dd>{speciesData.taxonomicUnit}</dd></div>}
              {speciesData.riskCode && <div><dt>风险编码:</dt><dd>{speciesData.riskCode}</dd></div>}
              {speciesData.guid && <div><dt>GUID:</dt><dd>{speciesData.guid}</dd></div>}
             </dl>
             <p>{speciesData.description}</p>
             {speciesData.sources && (
              <div className={sectionStyles.sourceInfo}>
                <strong>数据来源:</strong> {speciesData.sources}
              </div>
            )}
          </InfoSection>

          {speciesData.biology && (
            <InfoSection title="生物学特性" icon={faDna}>
              <p>{speciesData.biology.properties}</p>
              <dl className={`${sectionStyles.infoListInline} ${sectionStyles.smallDl}`}>
                {speciesData.biology.stages && <div><dt>主要发育阶段:</dt><dd>{speciesData.biology.stages}</dd></div>}
                {speciesData.biology.visibility && <div><dt>可见性:</dt><dd>{speciesData.biology.visibility}</dd></div>}
              </dl>
            </InfoSection>
          )}

          {speciesData.morphology && (
            <InfoSection title="形态学与检测" icon={faRulerCombined}>
              <p><strong>形态特征:</strong> {speciesData.morphology.characteristics}</p>
              <p><strong>检测方法:</strong></p>
              <ul>
                {speciesData.morphology.detectionMethods?.map((method, index) => (
                  <li key={index}>{method}</li>
                ))}
              </ul>
            </InfoSection>
          )}

          {speciesData.distribution && (
             <InfoSection title="地理分布" icon={faMapMarkedAlt}>
                <p>{speciesData.distribution.description}</p>
                <div className={styles.distributionDetails}>
                    <h4>主要分布区域:</h4>
                    {speciesData.distribution.areas?.map((area, index) => (
                        <div key={index} className={styles.distributionRegion}>
                            <strong>{area.region}:</strong>
                            <ul>
                                {area.locations?.map((loc, locIndex) => <li key={locIndex}>{loc}</li>)}
                            </ul>
                        </div>
                    ))}
                    {speciesData.distribution.statusDescription && <p><em>{speciesData.distribution.statusDescription}</em></p>}
                </div>
                <div className={sectionStyles.mapPlaceholderSmall}>
                    <p><FontAwesomeIcon icon={faMapMarkedAlt} /> 分布地图 (占位)</p>
                </div>
             </InfoSection>
          )}


          {speciesData.host && (
             <InfoSection title="寄主信息" icon={faTree}>
                <p><strong>寄主范围描述:</strong> {speciesData.host.rangeDescription}</p>
                <h4>主要寄主列表:</h4>
                <div className={tagStyles.tagContainer}>
                    {speciesData.host.hosts?.map((host, index) => (
                        <Tag
                            key={`${host.name}-${index}`}
                            text={`${host.name} (${host.scientificName})`}
                            type={getHostTagType(host.type)}
                            tooltip={`${host.type === 'primary' ? '主要' : host.type === 'secondary' ? '次要' : '偶发'}寄主, ${host.category}`}
                        />
                    ))}
                </div>
                <h4>危害部位与强度:</h4>
                <dl className={`${sectionStyles.infoListInline} ${sectionStyles.smallDl}`}>
                    {speciesData.host.affectedParts && <div><dt>主要危害部位:</dt><dd>{speciesData.host.affectedParts}</dd></div>}
                    {speciesData.host.intensity && <div><dt>侵染强度:</dt><dd>{speciesData.host.intensity}</dd></div>}
                </dl>
             </InfoSection>
          )}

           {speciesData.transmission && (
             <InfoSection title="传播途径与生态影响" icon={faExchangeAlt}>
                <p><strong>主要传播媒介:</strong></p>
                <div className={tagStyles.tagContainer}>
                    {speciesData.transmission.mediums?.map((medium, index) => (
                         <Tag
                            key={`${medium.name}-${index}`}
                            text={medium.name}
                            type={getMediumTagType(medium.type)}
                            tooltip={`${medium.type === 'Vector' ? '传播媒介' : '其他途径'} - ${medium.method}`}
                        />
                    ))}
                </div>
                <p><strong>传播方式描述:</strong> {speciesData.transmission.pathwayDescription}</p>
                <p><strong>潜在生态影响:</strong> {speciesData.transmission.ecoImpact}</p>
             </InfoSection>
          )}

          {speciesData.management && (
              <InfoSection title="管理与防治" icon={faShieldAlt}>
                  <p>{speciesData.management.summary}</p>
                  <h4>主要防治方法:</h4>
                  <ul>
                      {speciesData.management.methods?.map((method, index) => <li key={index}>{method}</li>)}
                  </ul>
                  {speciesData.management.remark && (
                      <p className={sectionStyles.remarkInfo}>
                        <FontAwesomeIcon icon={faInfoCircle} /> <strong>备注:</strong> {speciesData.management.remark}
                      </p>
                  )}
              </InfoSection>
          )}

          {speciesData.references && speciesData.references.length > 0 && (
             <InfoSection title="相关文献引用" icon={faBookOpen}>
                <ul className={styles.referenceList}>
                    {speciesData.references.map(ref => (
                        <li key={ref.id}>
                            <p>
                                <strong>{ref.title}</strong> - {ref.authors} {ref.year ? `(${ref.year})` : ''} <i>{ref.source}</i>
                            </p>
                            <div className={tagStyles.tagContainer}>
                                {ref.tags?.map((tag, index) => <Tag key={index} text={tag} type={getReferenceTagType(tag)} />)}
                            </div>
                            {ref.doi && <span className={styles.doiInfo}>DOI: <a href={`https://doi.org/${ref.doi}`} target="_blank" rel="noopener noreferrer">{ref.doi}</a></span>}
                            {ref.link && <Link href={ref.link} target="_blank" className={styles.refLink}><FontAwesomeIcon icon={faAngleRight} /> 查看链接</Link>}
                        </li>
                    ))}
                </ul>
             </InfoSection>
          )}
        </div>

        <aside className={styles.sideInfoColumn}>
            <InfoSection title="快速概览" icon={faBolt} className={styles.stickyCard}>
                 <dl className={styles.quickFactsList}>
                     {speciesData.taxonomy && speciesData.taxonomy.length > 0 &&
                         <div><dt><FontAwesomeIcon icon={faSitemap} />主要分类:</dt><dd>{speciesData.taxonomy[1]?.name || speciesData.taxonomy[0]?.name}</dd></div>
                     }
                     {speciesData.taxonomicUnit && <div><dt><FontAwesomeIcon icon={faTags} />分类层级:</dt><dd>{speciesData.taxonomicUnit}</dd></div>}
                     <div>
                      <dt><FontAwesomeIcon icon={faCheckCircle} />确认状态:</dt>
                      <dd className={`${styles.statusText} ${styles['status'+(speciesData.status?.charAt(0).toUpperCase() + speciesData.status?.slice(1))]}`}>
                        {speciesData.statusText}
                      </dd>
                    </div>
                    {speciesData.transmission && <div><dt><FontAwesomeIcon icon={faExchangeAlt} />主要传播:</dt><dd>{speciesData.transmission.mediums?.slice(0, 2).map(m => m.name).join(', ')}</dd></div>}
                    {speciesData.host && <div><dt><FontAwesomeIcon icon={faTree} />主要寄主:</dt><dd>{speciesData.host.hosts?.slice(0,1).map(h=>h.name)?.join('') || '未知'}</dd></div>}
                    {speciesData.management && <div><dt><FontAwesomeIcon icon={faShieldAlt} />核心防治:</dt><dd>{speciesData.management.methods?.slice(0, 2).join(', ')}</dd></div>}
                </dl>
            </InfoSection>

            {speciesData.taxonomy && speciesData.taxonomy.length > 0 && (
                 <InfoSection title="分类地位" icon={faSitemap} className={styles.stickyCard}>
                     <ul className={`${sectionStyles.compactList} ${styles.taxonomyList}`}>
                         {speciesData.taxonomy.map((taxon, index) => (
                             <li key={index} className={taxon.isCurrent ? styles.currentTaxon : ''}>
                                 {taxon.rank}: {taxon.name.includes('(') ? (
                                     <>
                                         {taxon.name.split('(')[0].trim()} (<i>{taxon.name.split('(')[1].replace(')', '').trim()}</i>)
                                     </>
                                 ) : (
                                     taxon.name
                                 )}
                             </li>
                         ))}
                     </ul>
                 </InfoSection>
            )}

            {speciesData.images && speciesData.images.length > 0 && (
                <InfoSection title="相关图片" icon={faImages} className={styles.stickyCard}>
                    <ImageGallery images={speciesData.images} />
                </InfoSection>
            )}

           {speciesData.otherNames && speciesData.otherNames.length > 0 && (
                <InfoSection title="其他名称" icon={faTags}>
                    <ul className={`${sectionStyles.compactList} ${sectionStyles.otherNamesList}`}>
                         {speciesData.otherNames.map((name, index) => (
                             <li key={index}>
                                 <span className={sectionStyles.nameType}>{name.type}:</span>
                                 <span className={sectionStyles.otherName}>{name.name}</span>
                                 {name.year && <span className={sectionStyles.namedYear}>({name.year})</span>}
                             </li>
                         ))}
                     </ul>
                </InfoSection>
           )}

            {speciesData.metadata && (
                <InfoSection title="元数据" icon={faCogs}>
                    <dl className={sectionStyles.metadataList}>
                        <div><dt>创建者:</dt><dd>{speciesData.metadata.creator}</dd></div>
                        <div><dt>创建时间:</dt><dd>{speciesData.metadata.createdAt}</dd></div>
                        {speciesData.metadata.editor && <div><dt>最后编辑者:</dt><dd>{speciesData.metadata.editor}</dd></div>}
                        {speciesData.metadata.updatedAt && <div><dt>更新时间:</dt><dd>{speciesData.metadata.updatedAt}</dd></div>}
                         {speciesData.metadata.reviewer && <div><dt>审核人:</dt><dd>{speciesData.metadata.reviewer}</dd></div>}
                         {speciesData.metadata.reviewedAt && <div><dt>审核时间:</dt><dd>{speciesData.metadata.reviewedAt}</dd></div>}
                    </dl>
                </InfoSection>
            )}
        </aside>
      </div>
    </div>
  );
}