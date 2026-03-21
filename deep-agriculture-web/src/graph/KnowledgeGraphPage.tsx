'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Spin, Alert } from 'antd';
import QuerySidebar from './components/QuerySidebar';
import AnalysisArea from './components/AnalysisArea';
import GraphVisualization from './components/GraphVisualization';
import InfoPanel from './components/InfoPanel';
import styles from './KnowledgeGraph.module.css';
import { fetchGraphData } from '@/services/graphApi';
import { getGraphOption } from './utils/echartsOptions';
import { GraphData, EChartClickParams } from './types';

const KnowledgeGraphPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [fullGraphData, setFullGraphData] = useState<GraphData | null>(null);
    const [displayGraphData, setDisplayGraphData] = useState<GraphData | null>(null);
    const [selectedItem, setSelectedItem] = useState<EChartClickParams | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [layoutType, setLayoutType] = useState<'force' | 'circular'>('force');
    const [showLabels, setShowLabels] = useState<boolean>(true);

    // ==========================================
    // 🛡️ 唯一合法的数据获取逻辑（删除了所有本地过滤逻辑）
    // ==========================================
    useEffect(() => {
        let isCancelled = false;

        const loadData = async () => {
            setIsLoading(true);
            setError(null);
            console.log(`🚀 发起后端检索: "${searchTerm || '首页默认'}"`);

            try {
                const fetchedData = await fetchGraphData(searchTerm);
                if (!isCancelled) {
                    setFullGraphData(fetchedData);
                    setDisplayGraphData(fetchedData);
                    console.log("✅ 数据渲染成功, 节点数:", fetchedData.nodes.length);
                }
            } catch (err: any) {
                if (!isCancelled) setError(err.message || "请求失败");
            } finally {
                if (!isCancelled) setIsLoading(false);
            }
        };

        loadData();
        return () => { isCancelled = true; };
    }, [searchTerm]);

    const handleSearch = useCallback((term: string) => { setSearchTerm(term); }, []);
    const handleLayoutChange = useCallback((layout: 'force' | 'circular') => { setLayoutType(layout); }, []);
    const handleShowLabelsChange = useCallback((show: boolean) => { setShowLabels(show); }, []);
    const handleChartClick = useCallback((params: EChartClickParams) => { setSelectedItem(params); }, []);

    const graphChartOption = useMemo(() => {
        if (!displayGraphData) return {};
        return getGraphOption(displayGraphData, showLabels, layoutType);
    }, [displayGraphData, showLabels, layoutType]);

    if (isLoading && !displayGraphData) return <div className={styles.loadingPlaceholder}><Spin size="large" /></div>;

    return (
        <div className={styles.kgContainer}>
            <main className={styles.kgMainContentGrid}>
                {error && <Alert message={error} type="error" showIcon />}
                <QuerySidebar
                    totalNodes={displayGraphData?.nodes.length || 0}
                    totalEdges={displayGraphData?.links.length || 0}
                    onSearch={handleSearch}
                    onLayoutChange={handleLayoutChange}
                    onShowLabelsChange={handleShowLabelsChange}
                    currentLayout={layoutType}
                    showLabels={showLabels}
                />
                <AnalysisArea graphData={displayGraphData} isLoading={isLoading} />
                <GraphVisualization chartOption={graphChartOption} isLoading={isLoading} onChartClick={handleChartClick} />
                <InfoPanel selectedItem={selectedItem} graphData={fullGraphData} />
            </main>
        </div>
    );
};

export default KnowledgeGraphPage;