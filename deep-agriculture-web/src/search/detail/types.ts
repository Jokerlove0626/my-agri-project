export interface SpeciesDetailData {
    id: string; 
    title: string;          // 👈 将 chineseName 改为 title，对齐搜索列表
    category: string;
    scientificName: string; 
    authorship?: string;    // 设为可选
    status: 'confirmed' | 'pending' | 'unknown'; 
    statusText: string; 
    iconClass?: string; 
  
    // 基本信息
    englishName?: string;
    englishAbbr?: string;
    taxonomicUnit?: string; 
    riskCode?: string;
    guid?: string;
    content: string;    // 👈 对应后端的 content
    description?: string;
    sources?: string; 
  
    // ... 其余 biology, morphology, distribution, host 等字段保持不变 ...
    // 这样以后你在后端录入了这些数据，前端能直接显示
    biology?: {
      properties: string;
      stages?: string;
      visibility?: string;
    };
    // ... 
    taxonomy?: { rank: string; name: string; isCurrent?: boolean }[]; 
    images?: { id: string; src: string; alt: string; caption: string; type: string }[];
}