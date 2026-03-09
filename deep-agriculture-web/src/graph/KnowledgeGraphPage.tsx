// src/graph/KnowledgeGraphPage.tsx
'use client'; // 声明为客户端组件

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Spin, Alert } from 'antd'; // 引入 Ant Design 组件用于加载和错误提示
import KGHeader from './components/KGHeader';
import QuerySidebar from './components/QuerySidebar';
import AnalysisArea from './components/AnalysisArea';
import GraphVisualization from './components/GraphVisualization';
import InfoPanel from './components/InfoPanel';
import styles from './KnowledgeGraph.module.css'; // 引入页面样式
// import { getMockGraphData } from './utils/mockData'; // 不再需要引入 Mock 数据函数
import { fetchGraphData } from '@/services/graphApi'; // **引入 API 调用函数**
import { getGraphOption } from './utils/echartsOptions';
import { GraphData, EChartClickParams, GraphNode, GraphLink } from './types';

const KnowledgeGraphPage: React.FC = () => {
    // --- 状态管理 ---
    const [isLoading, setIsLoading] = useState<boolean>(true); // 加载状态
    const [error, setError] = useState<string | null>(null);   // 错误状态
    const [fullGraphData, setFullGraphData] = useState<GraphData | null>(null); // 完整的原始数据
    const [displayGraphData, setDisplayGraphData] = useState<GraphData | null>(null); // 当前显示的数据(可能被过滤)
    const [selectedItem, setSelectedItem] = useState<EChartClickParams | null>(null); // 当前选中的节点或边
    const [searchTerm, setSearchTerm] = useState<string>(''); // 搜索词
    const [layoutType, setLayoutType] = useState<'force' | 'circular'>('force'); // 当前布局类型
    const [showLabels, setShowLabels] = useState<boolean>(true); // 是否显示标签

    // --- 数据加载 ---
    useEffect(() => {
        console.log('DeepForest KG 页面初始化 - 开始加载数据...');
        setIsLoading(true); // 开始加载，设置 loading 状态
        setError(null);     // 清除之前的错误
        setFullGraphData(null); // 清空旧数据
        setDisplayGraphData(null);

        // 定义异步函数来获取数据
        const loadData = async () => {
            try {
                // **调用 API 获取图谱数据**
                const fetchedData = await fetchGraphData();
                setFullGraphData(fetchedData);      // 存储完整数据
                setDisplayGraphData(fetchedData);   // 初始显示完整数据
                console.log(`[成功] 图谱数据加载完成: ${fetchedData.nodes.length} 个节点, ${fetchedData.links.length} 条关系.`);
            } catch (err: any) {
                console.error("[错误] 加载图谱数据时失败:", err);
                setError(err.message || "加载图谱数据时发生未知错误"); // 设置错误状态
            } finally {
                setIsLoading(false); // 无论成功或失败，都结束加载状态
            }
        };

        loadData(); // 执行加载函数

    }, []); // 空依赖数组，仅在组件挂载时执行一次

    // --- 搜索过滤逻辑 (保持不变) ---
    useEffect(() => {
        if (!fullGraphData) return;

        if (!searchTerm) {
            setDisplayGraphData(fullGraphData);
            return;
        }

        // 执行过滤 (这部分逻辑保持不变)
        const term = searchTerm.toLowerCase();
        // 过滤节点 (匹配 name 或 details 中的任何值)
        const filteredNodes = fullGraphData.nodes.filter(node =>
            node.name.toLowerCase().includes(term) ||
            (node.details && Object.values(node.details).some(val => String(val).toLowerCase().includes(term)))
        );
        const filteredNodeIds = new Set(filteredNodes.map(n => n.id));

        // 查找并包含一级邻居节点 (可选逻辑，让搜索结果更连通)
        const neighbors = new Set<string>(filteredNodeIds); // 直接包含搜索到的节点
        fullGraphData.links.forEach(link => {
            const sourceMatched = filteredNodeIds.has(link.source);
            const targetMatched = filteredNodeIds.has(link.target);
            // 如果边的任一端在初始过滤结果中，则将另一端也加入显示集合
            if (sourceMatched && !neighbors.has(link.target)) {
                neighbors.add(link.target);
            }
            if (targetMatched && !neighbors.has(link.source)) {
                neighbors.add(link.source);
            }
        });

        // 根据包含搜索结果和其邻居的 ID 集合来最终过滤节点和边
        const finalFilteredNodes = fullGraphData.nodes.filter(node => neighbors.has(node.id));
        const finalFilteredLinks = fullGraphData.links.filter(link =>
            neighbors.has(link.source) && neighbors.has(link.target)
        );


        console.log(`[搜索过滤] 关键词: "${searchTerm}", 结果: ${finalFilteredNodes.length} 个节点, ${finalFilteredLinks.length} 条关系.`);
        setDisplayGraphData({
            nodes: finalFilteredNodes,
            links: finalFilteredLinks,
            categories: fullGraphData.categories, // 保持原始分类
            speciesConfirmationStatus: fullGraphData.speciesConfirmationStatus // 保持状态统计
        });
        setSelectedItem(null); // 过滤后清除选中项

    }, [searchTerm, fullGraphData]);

    // --- 事件处理回调 (保持不变) ---
    const handleSearch = useCallback((term: string) => { setSearchTerm(term); }, []);
    const handleLayoutChange = useCallback((layout: 'force' | 'circular') => { setLayoutType(layout); }, []);
    const handleShowLabelsChange = useCallback((show: boolean) => { setShowLabels(show); }, []);
    const handleChartClick = useCallback((params: EChartClickParams) => {
        console.log('图谱点击:', params);
        setSelectedItem(params);
    }, []);

    // --- 计算 ECharts 选项 (保持不变) ---
    const graphChartOption = useMemo(() => {
        if (!displayGraphData) return {};
        return getGraphOption(displayGraphData, showLabels, layoutType);
    }, [displayGraphData, showLabels, layoutType]);

    // --- 渲染主函数 ---
    const renderMainContent = () => {
        // 1. 加载中
        if (isLoading) {
            return (
                <div className={styles.loadingPlaceholder} style={{ gridColumn: '1 / -1', gridRow: '1 / -1' }}>
                    <Spin size="large" />
                </div>
            );
        }
        // 2. 加载失败
        if (error) {
            return (
                 <div style={{ gridColumn: '1 / -1', gridRow: '1 / -1', padding: '20px' }}>
                    <Alert message="加载失败" description={error} type="error" showIcon />
                 </div>
            );
        }
         // 3. 数据为空 (理论上加载成功后 fullGraphData 不会是 null)
        if (!fullGraphData || !displayGraphData) {
            return (
                 <div style={{ gridColumn: '1 / -1', gridRow: '1 / -1', padding: '20px' }}>
                    <Alert message="无数据" description="未能获取到有效的图谱数据。" type="warning" showIcon />
                 </div>
            );
        }

        // 4. 正常渲染
        return (
            <>
                {/* 左侧查询区域 */}
                <QuerySidebar
                    totalNodes={displayGraphData?.nodes.length ?? 0} // 使用 ?? 提供默认值
                    totalEdges={displayGraphData?.links.length ?? 0}
                    onSearch={handleSearch}
                    onLayoutChange={handleLayoutChange}
                    onShowLabelsChange={handleShowLabelsChange}
                    currentLayout={layoutType}
                    showLabels={showLabels}
                />
                {/* 顶部图谱分析区域 */}
                <AnalysisArea
                    graphData={displayGraphData} // 分析区始终使用当前显示的数据
                    isLoading={isLoading} // 虽然 isLoading 此时为 false，但保留传递
                />
                {/* 中间知识图谱可视化区域 */}
                <GraphVisualization
                    chartOption={graphChartOption}
                    isLoading={isLoading}
                    onChartClick={handleChartClick}
                />
                {/* 右侧详细信息区域 */}
                <InfoPanel
                    selectedItem={selectedItem}
                    graphData={fullGraphData} // 信息面板需要完整数据来查找节点名称等
                />
            </>
        );
    };


    // --- 最终页面渲染 ---
    return (
        <div className={styles.kgContainer}>
            {/* 头部 */}
            {/* <KGHeader /> */}

            {/* 主要内容网格布局 */}
            {/* 根据加载/错误状态渲染不同内容 */}
            <main className={styles.kgMainContentGrid}>
                 {renderMainContent()}
            </main>
        </div>
    );
};

export default KnowledgeGraphPage;