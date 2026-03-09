// src/search/detail/types.ts (Create this file or add to existing types)

/**
 * 描述物种详细信息的接口 (示例)
 */
export interface SpeciesDetailData {
    id: string; // 唯一标识符
    chineseName: string; // 中文名
    scientificName: string; // 学名 (不含命名人)
    authorship: string; // 命名人信息
    status: 'confirmed' | 'pending' | 'unknown'; // 确认状态
    statusText: string; // 状态显示文本 (如 "已确认")
    iconClass?: string; // Font Awesome 图标类 (如 'fa-microscope')
  
    // 基本信息
    englishName?: string;
    englishAbbr?: string;
    taxonomicUnit?: string; // 如 "种 (Species)"
    riskCode?: string;
    guid?: string;
    description: string; // 主要概述
    sources?: string; // 数据来源
  
    // 生物学特性
    biology?: {
      properties: string; // 描述文本
      stages?: string; // 发育阶段
      visibility?: string; // 可见性
    };
  
    // 形态学与检测
    morphology?: {
      characteristics: string;
      detectionMethods: string[]; // 检测方法列表
    };
  
    // 地理分布
    distribution?: {
      description: string;
      areas: { region: string; locations: string[] }[]; // 分布区域结构化
      statusDescription?: string; // 状态描述
    };
  
    // 寄主信息
    host?: {
      rangeDescription: string;
      hosts: { name: string; scientificName: string; type: 'primary' | 'secondary' | 'occasional'; category: string }[]; // 寄主列表
      affectedParts?: string; // 危害部位
      intensity?: string; // 侵染强度
    };
  
    // 传播途径与影响
    transmission?: {
      mediums: { name: string; type: string; method: string }[]; // 传播媒介
      pathwayDescription: string; // 传播方式
      ecoImpact: string; // 生态影响
    };
  
    // 管理与防治
    management?: {
      summary: string; // 概述
      methods: string[]; // 防治方法列表
      remark?: string; // 备注
    };
  
    // 相关文献
    references?: { id: string; title: string; authors: string; source: string; year?: number; tags: string[]; doi?: string; link?: string; pdfPath?: string }[];
  
    // 分类地位
    taxonomy?: { rank: string; name: string; isCurrent?: boolean }[]; // 分类阶元列表
  
    // 相关图片
    images?: { id: string; src: string; alt: string; caption: string; type: string }[];
  
    // 其他名称
    otherNames?: { type: string; name: string; year?: string }[];
  
    // 元数据
    metadata?: {
      creator: string;
      createdAt: string; // Use string for simplicity, Date object in real app
      editor?: string;
      updatedAt?: string;
      reviewer?: string;
      reviewedAt?: string;
    };
  }