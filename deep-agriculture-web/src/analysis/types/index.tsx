// src/analysis/types/index.tsx

/**
 * 指标卡片的数据结构定义 (前端使用)
 * 与后端 MetricDataVO 对应
 */
export interface MetricData {
    id: string;
    icon: string; // 图标名称字符串
    label: string;
    value: string | number; // 值可以是数字或字符串
    unit?: string;
    periodLabel?: string;
    periodValue?: string | number; // 值可以是数字或字符串
    gradientClass: string;
}

/**
 * ECharts 配置项的基础类型
 * import type { EChartsOption } from 'echarts'; // 可以更精确
 */
export type EChartOption = any;

/**
 * 名称-值 对的数据结构 (前端使用)
 * 与后端 NameValueDataVO 对应
 */
export interface NameValueData {
    name: string;
    value: number; // 前端通常处理为 number
}

/**
 * 时间序列数据结构 (前端使用)
 * 与后端 TimeSeriesDataVO 对应
 */
export interface TimeSeriesData {
    dates: string[];
    counts: number[]; // 前端通常处理为 number 数组
}

/**
 * 地理分布数据结构 (前端使用)
 * 与后端 GeoDistributionDataVO 对应
 */
export interface GeoDistributionData {
    name: string; // 省份名称
    value: number; // 数值
}

/**
 * Top N 宿主数据结构 (前端使用)
 * 与后端 TopHostDataVO 对应
 */
export interface TopHostData {
    names: string[];
    counts: number[]; // 前端通常处理为 number 数组
}

/**
 * 图表卡片的数据结构定义 (前端使用)
 */
export interface ChartCardData {
    id: string;
    icon: string; // 图标名称字符串
    title: string;
    chartOption: EChartOption;
    chartHeight?: string;
    className?: string;
}

/**
 * 整个仪表盘的数据结构定义 (前端使用)
 * 对应后端 DashboardDataVO
 */
export interface DashboardData {
    metrics: MetricData[];
    speciesTaxonomy: NameValueData[];
    speciesStatus: NameValueData[];
    speciesGrowth: TimeSeriesData;
    geoDistribution: GeoDistributionData[];
    topHosts: TopHostData;
    referenceGrowth: TimeSeriesData;
    referenceTypes: NameValueData[];
    fileTypes: NameValueData[];
}

// 可以添加其他页面可能需要的类型定义