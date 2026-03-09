// src/graph/components/GraphVisualization.tsx
import React, { useRef, useMemo } from 'react'; // 引入 useMemo
import EChartBase, { EChartBaseRef } from './common/EChartBase';
import styles from '../KnowledgeGraph.module.css'; // 引入页面样式
import { EChartClickParams } from '../types';

interface GraphVisualizationProps {
    chartOption: any; // 主图谱的配置项
    isLoading: boolean;                 // 是否正在加载
    onChartClick: (params: EChartClickParams) => void; // 图表点击事件回调
}

const GraphVisualization: React.FC<GraphVisualizationProps> = ({ chartOption, isLoading, onChartClick }) => {
    const chartRef = useRef<EChartBaseRef>(null);

    // 问题二修复：使用 useMemo 稳定 handleEvents 对象引用
    // 这样即使 GraphVisualization 组件因为父组件状态变化而重新渲染，
    // 传递给 EChartBase 的 onEvents prop 的引用也不会改变（除非 onChartClick 本身改变）。
    // 这有助于防止 EChartBase 内部不必要的 useEffect 执行，从而避免图表实例被意外重置。
    const handleEvents = useMemo(() => ({
        'click': (params: any) => { // 使用 any 简化类型，实际应更精确
            // 只处理节点和边的点击事件
            if (params.dataType === 'node' || params.dataType === 'edge') {
                // 调用从父组件传递过来的回调函数
                onChartClick(params as EChartClickParams);
            }
        }
        // 可以添加其他事件，如 'mouseover' 等
    }), [onChartClick]); // 依赖项是 onChartClick，确保如果回调函数本身变化了，这个 memo 也更新

    return (
        <section className={styles.visualizationArea}>
            {isLoading ? (
                <div className={styles.loadingPlaceholder}>知识图谱加载中...</div>
            ) : (
                <EChartBase
                    ref={chartRef}
                    option={chartOption}
                    onEvents={handleEvents} // 传递稳定化的事件处理器
                    className={styles.graphContainer} // 确保应用容器样式
                    // 可以添加 theme
                />
            )}
        </section>
    );
};

export default GraphVisualization;