// src/graph/components/MiniChartCard.tsx
import React from 'react';
import EChartBase, { EChartBaseRef } from './common/EChartBase';
import Icon from './common/Icon';
import styles from '../KnowledgeGraph.module.css'; // 引入页面样式
import { IconProp } from '@fortawesome/fontawesome-svg-core';

interface MiniChartCardProps {
    title: string;                  // 卡片标题
    icon: IconProp;                 // 卡片图标 (FontAwesome)
    chartOption: any; // ECharts 配置
    isLoading?: boolean;             // 是否显示加载状态
}

const MiniChartCard: React.FC<MiniChartCardProps> = ({ title, icon, chartOption, isLoading = false }) => {
    const chartRef = React.useRef<EChartBaseRef>(null);

    return (
        <div className={styles.miniChartCard}>
            {/* 卡片头部 */}
            {/* <div className={styles.miniChartCardHeader}>
                <Icon icon={icon} />
                <span>{title}</span>
            </div> */}
            {/* 图表容器 */}
            <div className={styles.miniChartContainer}>
                <EChartBase
                    ref={chartRef}
                    option={chartOption}
                    showLoading={isLoading}
                    // 可以根据需要添加 theme 或 onEvents
                />
            </div>
        </div>
    );
};

export default MiniChartCard;