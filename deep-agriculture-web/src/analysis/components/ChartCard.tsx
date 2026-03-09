// src/analysis/components/ChartCard.tsx
import React from 'react';
import Icon from './common/Icon'; // 引入自定义 Icon 组件
import EChartBase from './common/EChartBase'; // 引入 ECharts 基础封装组件
import type { ChartCardData } from '@/analysis/types'; // 引入图表卡片数据类型定义
import { faSitemap, faLeaf, faBookOpen, faComments, faDatabase, faCheckCircle, faChartLine, faGlobeAsia, faBug, faChartArea, faTags, faFileAlt } from '@fortawesome/free-solid-svg-icons'; // 注意这里用 faGlobeAsia
import { IconProp } from '@fortawesome/fontawesome-svg-core'; // 引入 IconProp 类型

// 定义 ChartCard 组件的 Props 接口
interface ChartCardProps {
  chartData: ChartCardData; // 包含该图表卡片所有数据的对象
}

/**
 * 一个可重用的卡片组件，专门用于包裹和显示 ECharts 图表。
 *
 * @param chartData - 一个包含图表信息的对象 (来自 ChartCardData 类型)。
 */
const ChartCard: React.FC<ChartCardProps> = ({ chartData }) => {
  // 从 chartData 对象中解构所需属性
  const {
    id,
    icon: iconName, // 将传入的字符串 icon 名称重命名为 iconName
    title,
    chartOption, // ECharts 配置对象
    chartHeight, // 可选的自定义图表高度
    className   // 可选的附加 CSS 类名
  } = chartData;

  // --- 根据图标名称字符串获取对应的 FontAwesome IconProp 对象 ---
  const getIconObjectByName = (name: string): IconProp => {
    const iconMap: { [key: string]: IconProp } = { // 明确类型为 IconProp
      'sitemap': faSitemap,
      'leaf': faLeaf,
      'book-open': faBookOpen,
      'comments': faComments,
      'database': faDatabase,
      'check-circle': faCheckCircle,
      'chart-line': faChartLine,
      'globe-asia': faGlobeAsia, // 使用正确的地图图标
      'bug': faBug,
      'chart-area': faChartArea,
      'tags': faTags,
      'file-alt': faFileAlt
    };
    return iconMap[name] || faChartLine; // 默认返回 chart-line 图标对象
  };

  // --- 定义图表容器的内联样式 ---
  const chartContainerStyle: React.CSSProperties = {
    width: '100%', // 宽度始终为 100%
    height: chartHeight || '100%', // 高度优先使用传入值, 或由 flex 容器决定
    minHeight: '250px', // 设置一个合理的最小高度，防止图表过小
    // 确保 flex 布局下的子元素可以收缩和拉伸
    flexGrow: 1,
    flexShrink: 1,
    position: 'relative', // 添加相对定位，有时 ECharts 需要
    // overflow: 'hidden', // 如果图表内容溢出，可以选择隐藏
  };

  return (
    // 最外层 div 应用基础卡片样式、图表卡片特定样式以及可能的附加类名
    <div className={`card chart-card ${className || ''}`} id={`card-${id}`}>
      {/* 卡片头部 */}
      <div className="card-header">
        {/* 使用 Icon 组件，传递 IconProp 对象 */}
        <Icon icon={getIconObjectByName(iconName)} className={`icon icon-${iconName}`} />
        {/* 显示图表标题 */}
        <span>{title}</span>
      </div>

      {/* 图表容器 */}
      <div className="chart-container" style={{ /* 这里可以设置flex等布局样式 */ }}>
        {/*
          使用 EChartBase 组件来渲染图表。
          确保 EChartBase 的父容器有明确的尺寸或在 flex/grid 布局中能自动获取尺寸。
        */}
        <EChartBase
          option={chartOption}
          style={chartContainerStyle} // 应用计算好的样式
        />
      </div>
    </div>
  );
};

export default ChartCard; // 导出组件