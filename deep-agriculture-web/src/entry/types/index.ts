// src/entry/types/index.ts

/**
 * 表示一个动态添加的条目，包含唯一ID
 */
interface DynamicEntry {
    id: string | number; // 用于 React key 和删除操作的唯一标识
  }
  
  /**
   * 地理分布条目数据结构
   */
  export interface DistributionEntryData extends DynamicEntry {
    continentName: string;
    countryName: string;
    provinceName: string;
    description: string;
  }
  
  /**
   * 寄主条目数据结构
   */
  export interface HostEntryData extends DynamicEntry {
    hostName: string; // 学名 (必填)
    hostNameCn: string; // 中文名
    hostTypes: string; // 类型 (逗号分隔)
    interactionType: 'primary' | 'secondary' | 'occasional' | string; // 互作关系
    plantParts: string; // 危害部位 (逗号分隔)
    infectionIntensity: '' | 'low' | 'medium' | 'high'; // 侵染强度
  }
  
  /**
   * 其他名称条目数据结构
   */
  export interface OtherNameEntryData extends DynamicEntry {
    nameType: string; // 名称类型
    otherName: string; // 其他名称
    namedYear: string; // 命名年份
  }
  
  /**
   * 图片信息条目数据结构
   */
  export interface ImageEntryData extends DynamicEntry {
    title: string;
    type: string; // 图片类型
    path: string; // 存储路径
    contentDescription: string;
    copyrightDescription: string;
    orderBy: number;
    isHomeShow: '0' | '1'; // 是否首页展示
  }
  
  /**
   * 关联文献引用条目数据结构
   */
  export interface ReferenceEntryData extends DynamicEntry {
    icode: number | string; // 文献标识码 (必填)
    title: string;
    authorDisplay: string;
    referenceType: 'distribution' | 'biology' | 'control' | string; // 引用类型
    url: string; // 在线链接 (可选)
  }
  
  /**
   * 物种核心信息数据结构
   */
  export interface SpeciesCoreData {
    chineseName: string;
    scientificName: string;
    scientificNameWithAuthors: string;
    authorship: string;
    englishName: string;
    abbreviation: string;
    classification: string;
    parentGenus: string;
    taxonomicLevel: string;
    confirmationStatus: string;
    sources: string;
    originalRiskCode: string;
    isSpecies: 'TRUE' | 'FALSE';
  }
  
  /**
   * 物种基本信息详情数据结构
   */
  export interface SpeciesBasicInfoData {
      biologicalProperties: string;
      morphologicalCharacteristics: string;
      detectionMethod: string;
      distributionDescription: string;
      remark: string;
  }
  
  /**
   * 生态关系与管理数据结构
   */
  export interface SpeciesAssociationData {
      hostRange: string;
      potentialEcoDesc: string;
      description: string;
      managementInfo: string;
      remark: string;
  }
  
   /**
    * 参考文献元数据结构 (简化)
    */
   export interface ReferenceMetaData {
       icode: number | string;
       title: string;
       authors: string;
       sourceTitle: string;
       publishTime: string; // 使用 string 类型简化处理，实际可能用 Date
       abstract: string;
       keywords: string;
       doi: string;
   }
  
  /**
   * 完整表单数据结构
   */
  export interface EntryFormData {
    speciesCore: SpeciesCoreData;
    basicInfo: SpeciesBasicInfoData;
    distributions: DistributionEntryData[];
    hosts: HostEntryData[];
    otherNames: OtherNameEntryData[];
    images: ImageEntryData[];
    references: ReferenceEntryData[];
    associations: SpeciesAssociationData;
    // referenceMeta: ReferenceMetaData; // 参考文献元数据通常独立管理，此处可能只是展示或简化录入
  }