// src/graph/components/AnalysisArea.tsx
import React from 'react';
import MiniChartCard from './MiniChartCard';
import Icon from './common/Icon';
import styles from '../KnowledgeGraph.module.css'; // 引入页面样式
import { faChartBar, faPieChart, faShareAlt, faSortAmountUp, faCheckDouble } from '@fortawesome/free-solid-svg-icons';
import { GraphData } from '../types';
import {
    getNodeTypeOption,
    getEdgeTypeOption,
    getNodeDegreeOption,
    getSpeciesStatusDistOption
} from '../utils/echartsOptions'; // 引入选项生成函数

interface AnalysisAreaProps {
    graphData: GraphData | null; // 图谱数据，可能为 null
    isLoading: boolean;          // 是否正在加载
}

const AnalysisArea: React.FC<AnalysisAreaProps> = ({ graphData, isLoading }) => {

    // 根据 graphData 生成各个图表的配置项
    // 添加空对象 fallback 防止 graphData 为 null 时出错
    const nodeTypeOption = graphData ? getNodeTypeOption(graphData) : {};
    const edgeTypeOption = graphData ? getEdgeTypeOption(graphData) : {};
    const nodeDegreeOption = graphData ? getNodeDegreeOption(graphData) : {};
    const speciesStatusOption = graphData ? getSpeciesStatusDistOption(graphData.speciesConfirmationStatus) : {};

    return (
        <section className={styles.analysisArea}>
            <h3 className={styles.sidebarTitle}>
                <Icon icon={faChartBar} /> 图谱分析
            </h3>
            <div className={styles.analysisChartsHorizontal}>
                <MiniChartCard
                    title="节点类型分布"
                    icon={faPieChart}
                    chartOption={nodeTypeOption}
                    isLoading={isLoading}
                />
                <MiniChartCard
                    title="关系类型分布"
                    icon={faShareAlt}
                    chartOption={edgeTypeOption}
                    isLoading={isLoading}
                />
                <MiniChartCard
                    title="Top 5 度中心节点"
                    icon={faSortAmountUp}
                    chartOption={nodeDegreeOption}
                    isLoading={isLoading}
                />
                <MiniChartCard
                    title="物种确认状态"
                    icon={faCheckDouble}
                    chartOption={speciesStatusOption}
                    isLoading={isLoading}
                />
            </div>
        </section>
    );
};

export default AnalysisArea;