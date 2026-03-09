// src/graph/utils/echartsOptions.ts
import * as echarts from 'echarts/core'; // 引入 echarts 核心
// *** 核心修复：引入更具体的 ECharts 类型 ***
import type { EChartsOption, PieSeriesOption, BarSeriesOption } from 'echarts/types/dist/shared';
import { GraphData, GraphNode, GraphLink, GraphCategory, SpeciesStatus } from '../types';

// --- 主图谱选项 (保持不变，但建议也添加返回类型) ---
export function getGraphOption(graphData: GraphData, showLabels: boolean, layout: 'force' | 'circular'): EChartsOption { // **添加返回类型 EChartsOption**
    if (!graphData) return {};

    return {
        tooltip: {
            formatter: (params: any) => {
                if (params.dataType === 'node') {
                    const node = params.data as GraphNode;
                    let detailsHtml = `<b>${node.name.replace('\n', ' ')}</b><br/>类型: ${node.details?.type || graphData.categories[node.category]?.name || '未知'}`;
                    if (node.details) {
                        for (const key in node.details) {
                            // 简化属性过滤逻辑，显示大部分属性
                            if (!['id', 'name', 'value', 'category', 'symbolSize', 'x', 'y', 'itemStyle', 'label'].includes(key) && node.details[key]) {
                                let value = node.details[key];
                                if (typeof value === 'string' && value.length > 50) value = value.substring(0, 47) + '...';
                                // 对布尔值进行友好显示
                                if (typeof value === 'boolean') value = value ? '是' : '否';
                                detailsHtml += `<br/>${key}: ${value}`;
                            }
                        }
                    }
                    return detailsHtml;
                } else if (params.dataType === 'edge') {
                    const edge = params.data as GraphLink;
                    const type = edge.details?.type || '未知关系';
                    const sourceNode = graphData.nodes.find(n => n.id === edge.source);
                    const targetNode = graphData.nodes.find(n => n.id === edge.target);
                    const sourceName = sourceNode ? sourceNode.name.split('\n')[0] : edge.source;
                    const targetName = targetNode ? targetNode.name.split('\n')[0] : edge.target;
                    let detailsHtml = `关系: <b>${type}</b><br/>${sourceName} → ${targetName}`;
                     // 显示边的其他属性
                    if (edge.details) {
                        for (const key in edge.details) {
                            if (key !== 'type' && edge.details[key]) {
                                detailsHtml += `<br/>${key}: ${edge.details[key]}`;
                            }
                        }
                    }
                    return detailsHtml;
                }
                return '';
            },
            confine: true, // 限制 tooltip 在图表区域内
            enterable: true, // 允许鼠标进入 tooltip
            textStyle: { fontSize: 12 }
        },
        legend: [{
            data: graphData.categories.map(a => a.name),
            orient: 'horizontal', bottom: 10, left: 'center', itemWidth: 12, itemHeight: 12,
            textStyle: { fontSize: 10, color: '#666' }, backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: 5, borderRadius: 4
        }],
        series: [{
            type: 'graph', // 明确类型
            layout: layout,
            categories: graphData.categories,
            data: graphData.nodes.map(node => ({
                ...node,
                // 调整节点大小逻辑，避免过大或过小
                symbolSize: Math.max(15, Math.min(45, (node.value || 1) * 1.5 + 10)),
                label: {
                    show: showLabels,
                    position: 'right',
                    formatter: '{b}', // 只显示 name
                    fontSize: 9,
                    color: '#333',
                    overflow: 'truncate', // 超出宽度截断
                    width: 80 // 限制标签宽度
                },
                itemStyle: { // 基础样式
                    shadowBlur: 5,
                    shadowColor: 'rgba(0, 0, 0, 0.15)'
                },
            })),
            links: graphData.links.map(link => ({
                ...link,
                label: { show: false }, // 通常不显示边标签，除非需要
                lineStyle: { // 合并默认样式和特定样式
                    opacity: 0.6,
                    width: link.lineStyle?.width || 1,
                    color: link.lineStyle?.color || '#adb5bd', // 默认灰色
                    curveness: layout === 'force' ? 0.1 : 0 // 力导引用轻微曲线
                },
            })),
            roam: true, // 开启缩放和拖动
            label: { // 全局标签配置（会被节点内部的覆盖）
                show: showLabels,
                position: 'right',
                formatter: '{b}',
                fontSize: 9
            },
            force: { // 力导引布局参数
                repulsion: 90, // 节点间斥力因子
                gravity: 0.03, // 中心引力因子
                edgeLength: [80, 150], // 边的理想长度范围
                layoutAnimation: true // 开启动画效果
            },
            circular: { // 环形布局参数
                rotateLabel: true // 标签是否旋转
            },
            lineStyle: { // 全局边样式（会被边内部的覆盖）
                opacity: 0.6,
                width: 1,
                curveness: 0.1
            },
            emphasis: { // 高亮状态配置
                focus: 'adjacency', // 高亮相邻节点和边
                label: {
                    show: true, // 高亮时显示标签
                    fontSize: 11,
                    fontWeight: 'bold'
                 },
                lineStyle: { // 高亮边样式
                    width: 2.5,
                    opacity: 1
                },
                itemStyle: { // 高亮节点样式
                    borderColor: 'rgba(74, 144, 226, 0.8)',
                    borderWidth: 2.5,
                    shadowBlur: 10,
                    shadowColor: 'rgba(0, 0, 0, 0.2)'
                }
            }
        }]
    };
}

// --- 分析图表选项 (添加显式类型) ---

/**
 * 生成节点类型分布的饼图配置
 * @param graphData 图谱数据
 * @returns EChartsOption 饼图配置对象
 */
export function getNodeTypeOption(graphData: GraphData): EChartsOption { // **添加返回类型**
    if (!graphData || !graphData.nodes || !graphData.categories) return {};
    const typeCounts = graphData.nodes.reduce((acc, node) => {
        const categoryName = graphData.categories[node.category]?.name || '未知';
        acc[categoryName] = (acc[categoryName] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const data = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));

    // **核心修复：为 series 数组中的对象显式指定类型 PieSeriesOption**
    const seriesOption: PieSeriesOption = {
        name: '节点类型',
        type: 'pie', // **TypeScript 现在知道这里必须是 'pie'**
        radius: ['45%', '70%'],
        center: ['50%', '55%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 5, borderColor: '#fff', borderWidth: 1 },
        label: { show: true, fontSize: 9, formatter:'{b}\n{d}%' },
        labelLine: { show: true, length: 3, length2: 5 },
        data: data,
        color: graphData.categories.map(c => c.itemStyle?.color || '#ccc') // 使用类别颜色
    };

    return {
        tooltip: { trigger: 'item', formatter: '{b} : {c} ({d}%)' },
        legend: { show: false },
        series: [seriesOption] // **使用类型化的 seriesOption**
    };
}

/**
 * 生成关系类型分布的饼图配置
 * @param graphData 图谱数据
 * @returns EChartsOption 饼图配置对象
 */
export function getEdgeTypeOption(graphData: GraphData): EChartsOption { // **添加返回类型**
    if (!graphData || !graphData.links) return {};
    const typeCounts = graphData.links.reduce((acc, link) => {
        const typeName = link.details?.type || '未知关系';
        acc[typeName] = (acc[typeName] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const data = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));

    // **核心修复：显式指定类型 PieSeriesOption**
    const seriesOption: PieSeriesOption = {
        name: '关系类型',
        type: 'pie', // **明确类型**
        radius: '70%',
        center: ['50%', '55%'],
        avoidLabelOverlap: true,
        data: data,
        label: { show: true, fontSize: 9, formatter:'{b}\n{d}%' },
        labelLine: { show: true, length: 3, length2: 5 },
        itemStyle: { borderRadius: 5 },
        // 可以提供一个固定的颜色列表或根据关系类型动态生成
        color: ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE', '#3BA272', '#FC8452', '#9A60B4', '#EA7CCC']
    };

    return {
        tooltip: { trigger: 'item', formatter: '{b} : {c} ({d}%)' },
        legend: { show: false },
        series: [seriesOption] // **使用类型化的 seriesOption**
    };
}

/**
 * 生成 Top 5 度中心节点的条形图配置
 * @param graphData 图谱数据
 * @returns EChartsOption 条形图配置对象
 */
export function getNodeDegreeOption(graphData: GraphData): EChartsOption { // **添加返回类型**
    if (!graphData || !graphData.nodes || !graphData.links) return {};
    const degree: Record<string, number> = {};
    graphData.links.forEach(link => {
        degree[link.source] = (degree[link.source] || 0) + 1;
        degree[link.target] = (degree[link.target] || 0) + 1;
    });
    const sortedDegrees = Object.entries(degree).map(([id, count]) => {
        const node = graphData.nodes.find(n => n.id === id);
        let name = node ? node.name.replace('\n', ' ') : id;
        if (name.length > 15) {
           name = name.substring(0, 13) + '...';
        }
        return { name: name, value: count };
    }).sort((a, b) => b.value - a.value).slice(0, 5); // Top 5

    // **核心修复：显式指定类型 BarSeriesOption**
    const seriesOption: BarSeriesOption = {
        name: '连接数',
        type: 'bar', // **明确类型**
        data: sortedDegrees.map(d => d.value).reverse(),
        itemStyle: {
            color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{ offset: 0, color: '#83bff6' }, { offset: 1, color: '#188df0' }]),
            borderRadius: [0, 3, 3, 0]
        },
        label: { show: true, position: 'right', color: '#333', fontSize: 9 }
    };

    return {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '5%', right: '12%', bottom: '5%', containLabel: true }, // 调整边距确保标签显示
        xAxis: { type: 'value', boundaryGap: [0, 0.01], axisLabel: { fontSize: 10 } },
        yAxis: {
            type: 'category',
            data: sortedDegrees.map(d => d.name).reverse(),
            axisLabel: { fontSize: 9, interval: 0, width: 80, overflow: 'truncate' }
        },
        series: [seriesOption] // **使用类型化的 seriesOption**
    };
}

/**
 * 生成物种确认状态分布的饼图配置
 * @param statusData 物种状态数据列表
 * @returns EChartsOption 饼图配置对象
 */
export function getSpeciesStatusDistOption(statusData: SpeciesStatus[]): EChartsOption { // **添加返回类型**
    if (!statusData || statusData.length === 0) return {}; // 处理空数据情况

    // **核心修复：显式指定类型 PieSeriesOption**
    const seriesOption: PieSeriesOption = {
        name: '确认状态',
        type: 'pie', // **明确类型**
        radius: ['40%', '65%'],
        center: ['50%', '55%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 5, borderColor: '#fff', borderWidth: 1 },
        label: { show: true, fontSize: 9, formatter: '{b}\n{d}%' },
        labelLine: { show: true, length: 2, length2: 4 },
        data: statusData,
        color: ['#48c9b0', '#f39c12', '#e74c3c', '#a569bd'] // 提供一些颜色
    };

    return {
        tooltip: { trigger: 'item', formatter: '{b} : {c} ({d}%)' },
        legend: { show: false },
        series: [seriesOption] // **使用类型化的 seriesOption**
    };
}