// src/graph/types/index.ts

// ECharts 节点数据接口
export interface GraphNode {
    id: string;
    name: string;       // 节点名称 (可能包含换行符)
    value: number;      // 节点大小值
    category: number;   // 节点类型索引
    details: Record<string, any>; // 节点详细信息
    symbolSize?: number; // ECharts 实际使用的节点大小
    itemStyle?: {        // 节点样式 (可选)
        color?: string;
        borderColor?: string;
        borderWidth?: number;
        shadowBlur?: number;
        shadowColor?: string;
    };
    label?: {           // 节点标签样式 (可选)
        show?: boolean;
        position?: string;
        formatter?: string;
        fontSize?: number;
        color?: string;
        overflow?: string;
        width?: number;
    };
}

// ECharts 关系数据接口
export interface GraphLink {
    source: string;     // 源节点 ID
    target: string;     // 目标节点 ID
    details: Record<string, any>; // 关系详细信息
    lineStyle?: {       // 关系线样式 (可选)
        color?: string;
        width?: number;
        opacity?: number;
        curveness?: number;
    };
    label?: {           // 关系标签样式 (可选)
        show?: boolean;
    };
}

// ECharts 分类接口 (用于图例和节点颜色)
export interface GraphCategory {
    name: string;       // 类型名称
    itemStyle?: {       // 样式
        color: string;
    };
}

// 物种状态数据接口 (用于饼图)
export interface SpeciesStatus {
    name: string;       // 状态名称 (e.g., "已确认", "待审核")
    value: number;      // 该状态下的物种数量
}

// 完整的图谱数据结构
export interface GraphData {
    nodes: GraphNode[];
    links: GraphLink[];
    categories: GraphCategory[];
    speciesConfirmationStatus: SpeciesStatus[];
}

// ECharts 点击事件参数类型 (简化版)
export interface EChartClickParams {
    dataType: 'node' | 'edge';
    data: GraphNode | GraphLink;
    // 可能还有其他属性，根据需要添加
}

// ECharts 实例类型 (简化版，避免引入整个 echarts 类型)
export type EChartsInstance = any;