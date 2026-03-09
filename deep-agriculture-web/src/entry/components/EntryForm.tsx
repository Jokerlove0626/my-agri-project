// src/entry/components/EntryForm.tsx
'use client'; // 标记为客户端组件，因为使用了 useState 和事件处理

import React, { useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLeaf, faLanguage, faFlask, faUserEdit, faCalendarAlt, faGlobeAmericas,
  faTextWidth, faSitemap, faProjectDiagram, faLayerGroup, faCheckCircle,
  faBookReader, faExclamationTriangle, faQuestionCircle, faInfoCircle, faDna,
  faRulerCombined, faSearchPlus, faMapSigns, faCommentDots, faMapMarkedAlt,
  faTree, faTags, faImages, faBook, faUsersCog, faListAlt, faLink, faShieldAlt,
  faComment, faSave, faUndo, faPlusCircle, faEdit, faHashtag, faHeading, faUsers,
  faNewspaper, faCalendarCheck, faAlignLeft, faKey, faFingerprint
} from '@fortawesome/free-solid-svg-icons';

import EntryCard from './EntryCard';
import FormGroup from './FormGroup';
import AccordionItem from './AccordionItem';
// 导入其他 Section 和 Item 组件 (假设已创建)
import DistributionSection from './DistributionSection';
import HostSection from './HostSection'; // 假设已创建
import OtherNameSection from './OtherNameSection'; // 假设已创建
import ImageSection from './ImageSection'; // 假设已创建
import ReferenceSection from './ReferenceSection'; // 假设已创建

import styles from '../styles/EntryForm.module.css';
import {
    EntryFormData, SpeciesCoreData, SpeciesBasicInfoData, SpeciesAssociationData, ReferenceMetaData,
    DistributionEntryData, HostEntryData, OtherNameEntryData, ImageEntryData, ReferenceEntryData
} from '../types';

// 默认/初始状态
const initialCoreData: SpeciesCoreData = {
    chineseName: "松材线虫",
    scientificName: "Bursaphelenchus xylophilus",
    scientificNameWithAuthors: "Bursaphelenchus xylophilus (Steiner & Buhrer) Nickle",
    authorship: "(Steiner & Buhrer) Nickle, 1970",
    englishName: "Pine Wood Nematode",
    abbreviation: "PWN",
    classification: "线虫动物门",
    parentGenus: "Bursaphelenchus",
    taxonomicLevel: "种",
    confirmationStatus: "已确认",
    sources: "EPPO Global Database; CABI Compendium; 中国林业科学研究院",
    originalRiskCode: "HighRisk-001",
    isSpecies: "TRUE",
};

const initialBasicInfo: SpeciesBasicInfoData = {
    biologicalProperties: "典型的雌雄异体，卵生。生活史复杂，包含多个幼虫期和成虫期。存在特殊的扩散龄期（dauerlarva）适应环境并利于传播。繁殖速度受温度影响大。",
    morphologicalCharacteristics: "虫体微小，线形。口针发达，基部具球结。雌雄形态有差异，如尾部形状、交合刺等。",
    detectionMethod: "主要通过症状诊断、贝尔曼漏斗法分离、显微镜形态鉴定和PCR分子检测等方法。",
    distributionDescription: "起源于北美，现已传入亚洲和欧洲多国。主要分布在松树种植区域。",
    remark: "",
};

const initialDistributions: DistributionEntryData[] = [
  { id: 'dist1', continentName: "亚洲", countryName: "中国", provinceName: "江苏省", description: "存在 (Present), 广泛分布" },
  { id: 'dist2', continentName: "欧洲", countryName: "葡萄牙", provinceName: "", description: "存在 (Present)" },
];

const initialHosts: HostEntryData[] = [
    { id: 'host1', hostName: "Pinus densiflora", hostNameCn: "赤松", hostTypes: "自然寄主,主要寄主", interactionType: "primary", plantParts: "木质部,枝条", infectionIntensity: "high" }
];

const initialOtherNames: OtherNameEntryData[] = [
    { id: 'on1', nameType: "异名 (Synonym)", otherName: "Aphelenchoides xylophilus", namedYear: "1934"}
];

const initialImages: ImageEntryData[] = [
    { id: 'img1', title: "松材线虫显微照片", type: "显微图", path: "/images/pwn_microscope_01.jpg", contentDescription: "高倍镜下显示的松材线虫成虫形态", copyrightDescription: "CC BY-SA 4.0 - Forest Pest Lab", orderBy: 1, isHomeShow: "1"}
];

const initialReferences: ReferenceEntryData[] = [
    { id: 'ref1', icode: 1001, title: "松材线虫病研究进展", authorDisplay: "叶建仁, 孙江华 (2010)", referenceType: "biology", url: "" }
];

 const initialAssociations: SpeciesAssociationData = {
    hostRange: "主要寄主为松属植物，尤其是二针和五针松类。对不同松种的易感性有差异。",
    potentialEcoDesc: "导致松林生态系统崩溃，生物多样性降低，影响水源涵养。",
    description: "主要通过松墨天牛等媒介昆虫传播，也可随带疫木材远距离扩散。",
    managementInfo: "综合运用检疫、疫木清理、媒介防治、树干注药、抗性品种等措施。",
    remark: "",
};

// 简化版，实际可能更复杂或独立管理
const initialRefMeta: ReferenceMetaData = {
     icode: '', title: '', authors: '', sourceTitle: '', publishTime: '', abstract: '', keywords: '', doi: ''
};

// --- 表单组件 ---
const EntryForm: React.FC = () => {
  // --- 状态定义 ---
  const [coreData, setCoreData] = useState<SpeciesCoreData>(initialCoreData);
  const [basicInfo, setBasicInfo] = useState<SpeciesBasicInfoData>(initialBasicInfo);
  const [distributions, setDistributions] = useState<DistributionEntryData[]>(initialDistributions);
  const [hosts, setHosts] = useState<HostEntryData[]>(initialHosts);
  const [otherNames, setOtherNames] = useState<OtherNameEntryData[]>(initialOtherNames);
  const [images, setImages] = useState<ImageEntryData[]>(initialImages);
  const [references, setReferences] = useState<ReferenceEntryData[]>(initialReferences);
  const [associations, setAssociations] = useState<SpeciesAssociationData>(initialAssociations);
  const [refMeta, setRefMeta] = useState<ReferenceMetaData>(initialRefMeta); // 简化处理

  // --- 通用处理函数 ---
  const handleInputChange = <T, K extends keyof T>(
    setter: React.Dispatch<React.SetStateAction<T>>,
    field: K
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setter(prev => ({ ...prev, [field]: value }));
  };

  // --- 动态条目处理函数 ---
  const createNewId = (prefix: string): string => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

  // -- Distribution --
  const handleAddDistribution = useCallback(() => {
    setDistributions(prev => [...prev, { id: createNewId('dist'), continentName: '', countryName: '', provinceName: '', description: '' }]);
  }, []);
  const handleRemoveDistribution = useCallback((id: string | number) => {
    setDistributions(prev => prev.filter(item => item.id !== id));
  }, []);
  const handleDistributionChange = useCallback((id: string | number, field: keyof Omit<DistributionEntryData, 'id'>, value: string) => {
    setDistributions(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  }, []);

  // -- Host -- (需要创建 HostSection 和 HostItem 组件)
  const handleAddHost = useCallback(() => {
     setHosts(prev => [...prev, { id: createNewId('host'), hostName: "", hostNameCn: "", hostTypes: "", interactionType: "primary", plantParts: "", infectionIntensity: "" }]);
  }, []);
  const handleRemoveHost = useCallback((id: string | number) => {
     setHosts(prev => prev.filter(item => item.id !== id));
  }, []);
  const handleHostChange = useCallback((id: string | number, field: keyof Omit<HostEntryData, 'id'>, value: string | number) => {
     setHosts(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  }, []);

  // -- OtherName -- (需要创建 OtherNameSection 和 OtherNameItem 组件)
   const handleAddOtherName = useCallback(() => {
       setOtherNames(prev => [...prev, { id: createNewId('on'), nameType: '', otherName: '', namedYear: '' }]);
   }, []);
   const handleRemoveOtherName = useCallback((id: string | number) => {
       setOtherNames(prev => prev.filter(item => item.id !== id));
   }, []);
   const handleOtherNameChange = useCallback((id: string | number, field: keyof Omit<OtherNameEntryData, 'id'>, value: string) => {
       setOtherNames(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
   }, []);

   // -- Image -- (需要创建 ImageSection 和 ImageItem 组件)
   const handleAddImage = useCallback(() => {
       setImages(prev => [...prev, { id: createNewId('img'), title: '', type: '', path: '', contentDescription: '', copyrightDescription: '', orderBy: 0, isHomeShow: '0' }]);
   }, []);
   const handleRemoveImage = useCallback((id: string | number) => {
       setImages(prev => prev.filter(item => item.id !== id));
   }, []);
   const handleImageChange = useCallback((id: string | number, field: keyof Omit<ImageEntryData, 'id'>, value: string | number) => {
       setImages(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
   }, []);

   // -- Reference -- (需要创建 ReferenceSection 和 ReferenceItem 组件)
   const handleAddReference = useCallback(() => {
       setReferences(prev => [...prev, { id: createNewId('ref'), icode: '', title: '', authorDisplay: '', referenceType: 'distribution', url: '' }]);
   }, []);
   const handleRemoveReference = useCallback((id: string | number) => {
       setReferences(prev => prev.filter(item => item.id !== id));
   }, []);
   const handleReferenceChange = useCallback((id: string | number, field: keyof Omit<ReferenceEntryData, 'id'>, value: string | number) => {
       setReferences(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
   }, []);


  // --- 表单提交与重置 ---
  // --- 表单提交与重置 ---
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // 1. 收集所有数据 (保留原逻辑)
    const formData: EntryFormData = {
      speciesCore: coreData,
      basicInfo: basicInfo,
      distributions: distributions,
      hosts: hosts,
      otherNames: otherNames,
      images: images,
      references: references,
      associations: associations,
    };
    console.log("准备发送的数据:", formData);

    // 2. 将复杂结构压缩为 RAG 检索需要的精简格式 (降维处理)
    const title = coreData.chineseName || coreData.scientificName || "未知物种";
    const category = coreData.classification || "林业病虫害";
    
    // 智能拼接所有的关键特征，喂给大模型做知识检索
    const contentText = `
【物种学名】: ${coreData.scientificName}
【生物学特性】: ${basicInfo.biologicalProperties}
【形态特征】: ${basicInfo.morphologicalCharacteristics}
【检测方法】: ${basicInfo.detectionMethod}
【寄主范围】: ${associations.hostRange}
【防控管理措施】: ${associations.managementInfo}
    `.trim();

    // 3. 发送网络请求给 Python 后端
    try {
      const response = await fetch('/api/knowledge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // 发送给后端的结构：{ title, content, category }
        body: JSON.stringify({
          title: title,
          category: category,
          content: contentText
        }),
      });

      if (response.ok) {
        const resData = await response.json();
        alert(`✅ 数据已成功录入知识库！\n知识ID: ${resData.id}`);
        // 录入成功后清空表单
        handleReset(); 
      } else {
        alert('❌ 录入失败，请检查后端服务是否启动。');
      }
    } catch (error) {
      console.error('提交请求失败:', error);
      alert('❌ 网络错误，无法连接到后端 API。');
    }
  };

  const handleReset = () => {
    setCoreData(initialCoreData);
    setBasicInfo(initialBasicInfo);
    setDistributions(initialDistributions);
    setHosts(initialHosts);
    setOtherNames(initialOtherNames);
    setImages(initialImages);
    setReferences(initialReferences);
    setAssociations(initialAssociations);
    setRefMeta(initialRefMeta);
    console.log("Form reset to initial values.");
     alert("表单已重置为初始值。");
  };

  // --- JSX 渲染 ---
  return (
    <form id="entryForm" className={styles.entryFormContainer} onSubmit={handleSubmit} onReset={handleReset}>

      {/* --- 卡片: 物种核心信息 --- */}
      <EntryCard title="物种核心信息录入 (Species)" icon={faLeaf} useGradientTitle className={styles.mainEntryCard}>
        <div className={styles.formGrid}>
          {/* 中文名称 */}
          <FormGroup label="中文名称" icon={faLanguage} htmlFor="chineseName">
            <input type="text" id="chineseName" name="species_chinese_name" value={coreData.chineseName} onChange={handleInputChange(setCoreData, 'chineseName')} required />
          </FormGroup>
          {/* 物种学名 */}
          <FormGroup label="物种学名 (拉丁名)" icon={faFlask} htmlFor="scientificName">
            <input type="text" id="scientificName" name="species_scientific_name" value={coreData.scientificName} onChange={handleInputChange(setCoreData, 'scientificName')} required />
          </FormGroup>
          {/* 含命名人学名 */}
           <FormGroup label="含命名人学名" icon={faUserEdit} htmlFor="scientificNameAuthors">
             <input type="text" id="scientificNameAuthors" name="species_scientific_name_with_authors" value={coreData.scientificNameWithAuthors} onChange={handleInputChange(setCoreData, 'scientificNameWithAuthors')} />
           </FormGroup>
           {/* 命名信息 */}
           <FormGroup label="命名信息 (作者+年份)" icon={faCalendarAlt} htmlFor="authorship">
             <input type="text" id="authorship" name="species_authorship" value={coreData.authorship} onChange={handleInputChange(setCoreData, 'authorship')} />
           </FormGroup>
           {/* 英文名称 */}
           <FormGroup label="英文名称" icon={faGlobeAmericas} htmlFor="englishName">
             <input type="text" id="englishName" name="species_english_name" value={coreData.englishName} onChange={handleInputChange(setCoreData, 'englishName')} />
           </FormGroup>
           {/* 英文缩写 */}
           <FormGroup label="英文缩写" icon={faTextWidth} htmlFor="abbreviation">
             <input type="text" id="abbreviation" name="species_abbreviation" value={coreData.abbreviation} onChange={handleInputChange(setCoreData, 'abbreviation')} />
           </FormGroup>
           {/* 物种分类 */}
           <FormGroup label="物种分类 (纲/门级)" icon={faSitemap} htmlFor="classification">
             <input type="text" id="classification" name="species_classification" value={coreData.classification} onChange={handleInputChange(setCoreData, 'classification')} />
           </FormGroup>
           {/* 父级属名 */}
           <FormGroup label="父级属名" icon={faProjectDiagram} htmlFor="parentGenus">
             <input type="text" id="parentGenus" name="species_parent_genus" value={coreData.parentGenus} onChange={handleInputChange(setCoreData, 'parentGenus')} />
           </FormGroup>
            {/* 分类层级 */}
           <FormGroup label="分类层级" icon={faLayerGroup} htmlFor="taxonomicLevel">
             <select id="taxonomicLevel" name="species_taxonomic_level" value={coreData.taxonomicLevel} onChange={handleInputChange(setCoreData, 'taxonomicLevel')}>
               <option value="种">种 (Species)</option>
               <option value="属">属 (Genus)</option>
               <option value="科">科 (Family)</option>
               <option value="目">目 (Order)</option>
               <option value="纲">纲 (Class)</option>
               <option value="门">门 (Phylum)</option>
               <option value="界">界 (Kingdom)</option>
             </select>
           </FormGroup>
           {/* 确认状态 */}
           <FormGroup label="确认状态" icon={faCheckCircle} htmlFor="confirmationStatus">
             <select id="confirmationStatus" name="species_confirmation_status" value={coreData.confirmationStatus} onChange={handleInputChange(setCoreData, 'confirmationStatus')}>
               <option value="已确认">已确认</option>
               <option value="待审核">待审核</option>
               <option value="有疑问">有疑问</option>
             </select>
           </FormGroup>
           {/* 数据来源 */}
            <FormGroup label="数据来源 (多源用分号;分隔)" icon={faBookReader} htmlFor="sources" fullWidth>
              <textarea id="sources" name="species_sources" rows={2} value={coreData.sources} onChange={handleInputChange(setCoreData, 'sources')}></textarea>
            </FormGroup>
            {/* 原始风险等级编码 */}
            <FormGroup label="原始风险等级编码" icon={faExclamationTriangle} htmlFor="originalRiskCode">
              <input type="text" id="originalRiskCode" name="species_original_risk_code" value={coreData.originalRiskCode} onChange={handleInputChange(setCoreData, 'originalRiskCode')} />
            </FormGroup>
             {/* 是否物种级 */}
            <FormGroup label="是否物种级" icon={faQuestionCircle} htmlFor="isSpecies">
              <select id="isSpecies" name="species_is_species" value={coreData.isSpecies} onChange={handleInputChange(setCoreData, 'isSpecies')}>
                 <option value="TRUE">是 (TRUE)</option>
                 <option value="FALSE">否 (FALSE)</option>
              </select>
            </FormGroup>
        </div>

        {/* --- 折叠区域 --- */}
        <div className={styles.accordionContainer}>
          {/* 基本信息详情 */}
          <AccordionItem title="基本信息详情 (可选项)" icon={faInfoCircle}>
            <div className={styles.formGrid}>
                <FormGroup label="生物学特性描述" icon={faDna} htmlFor="biologicalProperties" fullWidth>
                    <textarea id="biologicalProperties" name="basic_info_biological_properties" rows={4} value={basicInfo.biologicalProperties} onChange={handleInputChange(setBasicInfo, 'biologicalProperties')}></textarea>
                </FormGroup>
                <FormGroup label="形态学特征描述" icon={faRulerCombined} htmlFor="morphologicalChars" fullWidth>
                     <textarea id="morphologicalChars" name="basic_info_morphological_characteristics" rows={4} value={basicInfo.morphologicalCharacteristics} onChange={handleInputChange(setBasicInfo, 'morphologicalCharacteristics')}></textarea>
                </FormGroup>
                <FormGroup label="检测方法描述" icon={faSearchPlus} htmlFor="detectionMethod" fullWidth>
                     <textarea id="detectionMethod" name="basic_info_detection_method" rows={3} value={basicInfo.detectionMethod} onChange={handleInputChange(setBasicInfo, 'detectionMethod')}></textarea>
                </FormGroup>
                <FormGroup label="分布描述文本" icon={faMapSigns} htmlFor="distributionDescription" fullWidth>
                     <textarea id="distributionDescription" name="basic_info_distribution_description" rows={3} value={basicInfo.distributionDescription} onChange={handleInputChange(setBasicInfo, 'distributionDescription')}></textarea>
                </FormGroup>
                 <FormGroup label="备注信息" icon={faCommentDots} htmlFor="basicInfoRemark" fullWidth>
                     <textarea id="basicInfoRemark" name="basic_info_remark" rows={2} value={basicInfo.remark} onChange={handleInputChange(setBasicInfo, 'remark')}></textarea>
                 </FormGroup>
            </div>
          </AccordionItem>

          {/* 地理分布 */}
          <DistributionSection
            items={distributions}
            onAdd={handleAddDistribution}
            onRemove={handleRemoveDistribution}
            onChange={handleDistributionChange}
          />

          {/* 寄主植物 (需要实现 HostSection) */}
           <HostSection
             items={hosts}
             onAdd={handleAddHost}
             onRemove={handleRemoveHost}
             onChange={handleHostChange}
           />

          {/* 其他名称 (需要实现 OtherNameSection) */}
           <OtherNameSection
             items={otherNames}
             onAdd={handleAddOtherName}
             onRemove={handleRemoveOtherName}
             onChange={handleOtherNameChange}
           />

          {/* 相关图片 (需要实现 ImageSection) */}
           <ImageSection
             items={images}
             onAdd={handleAddImage}
             onRemove={handleRemoveImage}
             onChange={handleImageChange}
           />

          {/* 关联文献 (需要实现 ReferenceSection) */}
           <ReferenceSection
             items={references}
             onAdd={handleAddReference}
             onRemove={handleRemoveReference}
             onChange={handleReferenceChange}
           />

          {/* 生态关系与管理 */}
          <AccordionItem title="生态关系与管理 (可选项)" icon={faUsersCog}>
            <div className={styles.formGrid}>
                <FormGroup label="寄主范围详细描述" icon={faListAlt} htmlFor="hostRangeDesc" fullWidth>
                    <textarea id="hostRangeDesc" name="assoc_host_range" rows={3} value={associations.hostRange} onChange={handleInputChange(setAssociations, 'hostRange')}></textarea>
                </FormGroup>
                <FormGroup label="潜在生态影响分析" icon={faLeaf} htmlFor="potentialEcoDesc" fullWidth>
                    <textarea id="potentialEcoDesc" name="assoc_potential_eco_desc" rows={3} value={associations.potentialEcoDesc} onChange={handleInputChange(setAssociations, 'potentialEcoDesc')}></textarea>
                </FormGroup>
                <FormGroup label="关联关系核心描述" icon={faLink} htmlFor="associationDesc" fullWidth>
                    <textarea id="associationDesc" name="assoc_description" rows={3} placeholder="传播途径、互作关系等" value={associations.description} onChange={handleInputChange(setAssociations, 'description')}></textarea>
                </FormGroup>
                <FormGroup label="防控管理措施信息" icon={faShieldAlt} htmlFor="managementInfo" fullWidth>
                    <textarea id="managementInfo" name="assoc_management_info" rows={4} value={associations.managementInfo} onChange={handleInputChange(setAssociations, 'managementInfo')}></textarea>
                </FormGroup>
                 <FormGroup label="补充信息 (可含URL)" icon={faComment} htmlFor="associationRemark" fullWidth>
                     <textarea id="associationRemark" name="assoc_remark" rows={2} value={associations.remark} onChange={handleInputChange(setAssociations, 'remark')}></textarea>
                 </FormGroup>
            </div>
          </AccordionItem>

        </div>

        {/* --- 提交按钮 --- */}
        <div className={styles.formActions}>
          <button type="submit" className={`${styles.submitButton} ${styles.gradientAccent}`}>
            <FontAwesomeIcon icon={faSave} /> 保存物种信息
          </button>
          <button type="reset" className={styles.resetButton}>
            <FontAwesomeIcon icon={faUndo} /> 重置表单
          </button>
        </div>
      </EntryCard>

       {/* --- 卡片: 参考文献元数据录入 (简化版) --- */}
       <EntryCard title="参考文献元数据录入 (Reference Info)" icon={faBook} className={styles.referenceEntryCard}>
           <p className={styles.formHint}>在此录入文献的详细信息，上方“关联文献引用”部分只需填写标识码进行关联。</p>
           <div className={styles.formGrid}>
               <FormGroup label="文献标识码(icode)" icon={faHashtag} htmlFor="refInfoIcode">
                   <input type="number" id="refInfoIcode" name="ref_info_icode" value={refMeta.icode} onChange={handleInputChange(setRefMeta, 'icode')} required placeholder="与关联引用中的icode对应" />
               </FormGroup>
               <FormGroup label="文献标题" icon={faHeading} htmlFor="refInfoTitle">
                    <input type="text" id="refInfoTitle" name="ref_info_title" value={refMeta.title} onChange={handleInputChange(setRefMeta, 'title')} required />
               </FormGroup>
               <FormGroup label="作者列表 (逗号分隔)" icon={faUsers} htmlFor="refInfoAuthors">
                   <input type="text" id="refInfoAuthors" name="ref_info_authors" value={refMeta.authors} onChange={handleInputChange(setRefMeta, 'authors')} />
               </FormGroup>
               <FormGroup label="来源期刊/出版物" icon={faNewspaper} htmlFor="refInfoSourceTitle">
                   <input type="text" id="refInfoSourceTitle" name="ref_info_source_title" value={refMeta.sourceTitle} onChange={handleInputChange(setRefMeta, 'sourceTitle')} />
               </FormGroup>
               <FormGroup label="发表时间" icon={faCalendarCheck} htmlFor="refInfoPublishTime">
                    {/* 简单起见用 text，实际可用 date/datetime-local */}
                   <input type="text" id="refInfoPublishTime" name="ref_info_publish_time" placeholder="如: 2023-10-26 or 2023" value={refMeta.publishTime} onChange={handleInputChange(setRefMeta, 'publishTime')} />
               </FormGroup>
               <FormGroup label="摘要" icon={faAlignLeft} htmlFor="refInfoAbstract" fullWidth>
                   <textarea id="refInfoAbstract" name="ref_info_abstract" rows={4} value={refMeta.abstract} onChange={handleInputChange(setRefMeta, 'abstract')}></textarea>
               </FormGroup>
               <FormGroup label="关键词 (分号分隔)" icon={faKey} htmlFor="refInfoKeywords">
                   <input type="text" id="refInfoKeywords" name="ref_info_keywords" value={refMeta.keywords} onChange={handleInputChange(setRefMeta, 'keywords')} />
               </FormGroup>
               <FormGroup label="DOI" icon={faFingerprint} htmlFor="refInfoDOI">
                   <input type="text" id="refInfoDOI" name="ref_info_doi" value={refMeta.doi} onChange={handleInputChange(setRefMeta, 'doi')} />
               </FormGroup>
           </div>
           {/* 简化版，没有独立保存按钮 */}
           {/* <div className={styles.formActions}>
               <button type="button" className={`${styles.submitButton} ${styles.gradientBlueLight}`}>
                   <FontAwesomeIcon icon={faSave} /> 保存文献信息
               </button>
           </div> */}
       </EntryCard>

        {/* --- 卡片: Neo4j 提示 --- */}
        <EntryCard title="Neo4j 图构建说明" icon={faProjectDiagram} className={styles.neo4jHintCard}>
           <p>上述录入的结构化数据将用于构建知识图谱。例如：</p>
           <ul>
               <li><code>species</code> 表记录将创建 <code>(s:Species)</code> 节点。</li>
               <li><code>species_host</code> 记录将创建 <code>(s)-[:HOSTS_ON]-&gt;(h:Host)</code> 关系。</li>
               <li><code>species_distribution</code> 记录将创建 <code>(s)-[:DISTRIBUTED_IN]-&gt;(l:Location)</code> 关系。</li>
               <li><code>reference_relation</code> 记录将创建 <code>(s)-[:MENTIONED_IN]-&gt;(r:Reference)</code> 关系。</li>
           </ul>
           <p>如有必要，可在此处补充或调整图特定的属性或关系（此原型中未实现具体输入）。</p>
        </EntryCard>

    </form>
  );
};

export default EntryForm;