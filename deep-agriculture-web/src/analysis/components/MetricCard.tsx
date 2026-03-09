// src/analysis/components/MetricCard.tsx
import React from 'react';
import Icon from './common/Icon'; // 引入自定义 Icon 组件
import type { MetricData } from '@/analysis/types'; // 引入指标数据类型定义
import { faLeaf, faBookOpen, faComments, faDatabase, faSitemap, faCheckCircle, faChartLine, faGlobe, faBug, faChartArea, faTags, faFileAlt } from '@fortawesome/free-solid-svg-icons';

// 定义 MetricCard 组件的 Props 接口
interface MetricCardProps {
  metric: MetricData; // 包含该卡片所有数据的对象
}

/**
 * 用于展示单个关键性能指标 (KPI) 的卡片组件。
 *
 * @param metric - 一个包含指标信息的对象 (来自 MetricData 类型)。
 *                例如：{ id: 'species', icon: 'leaf', label: '物种总数', value: 1853, gradientClass: 'gradient-green', periodLabel: '已收录' }
 */
const MetricCard: React.FC<MetricCardProps> = ({ metric }) => {
  // 从 metric 对象中解构所需属性
  const {
    id,
    icon,
    label,
    value,
    unit,
    periodLabel,
    periodValue,
    gradientClass // CSS 类名，用于设置背景渐变
  } = metric;

  // 根据图标名称获取对应的FontAwesome图标
  const getIconByName = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      'leaf': faLeaf,
      'book-open': faBookOpen,
      'comments': faComments,
      'database': faDatabase,
      'sitemap': faSitemap,
      'check-circle': faCheckCircle,
      'chart-line': faChartLine,
      'globe-asia': faGlobe,
      'bug': faBug,
      'chart-area': faChartArea,
      'tags': faTags,
      'file-alt': faFileAlt
    };
    return iconMap[iconName] || faLeaf; // 默认返回leaf图标
  };

  return (
    // 最外层 div 应用基础卡片样式、指标卡片特定样式以及渐变背景类
    <div className={`card metric-card ${gradientClass}`}>
      {/* 卡片头部 */}
      <div className="card-header">
        {/*
          使用 Icon 组件显示图标。
          iconName prop 传递图标名称字符串。
          className 用于应用 CSS 样式，可以添加一个基于图标名称的特定类，方便 CSS 选择器定位。
        */}
        <Icon icon={getIconByName(icon)} className={`icon icon-${icon}`} />
        {/* 显示指标标签 */}
        <span>{label}</span>
      </div>

      {/* 指标数值显示区域 */}
      <div className="metric-value">
        {/*
          显示指标值。
          如果值是数字，使用 toLocaleString() 进行格式化（例如添加千位分隔符）。
          如果是字符串，直接显示。
        */}
        {typeof value === 'number' ? value.toLocaleString() : value}
        {/* 如果有单位 (unit)，则在值后面显示单位 */}
        {unit && <span className="metric-sub"> {unit}</span>}
      </div>

      {/* 指标周期信息显示区域 (可选) */}
      {/* 只有当 periodLabel 存在时才渲染这部分 */}
      {periodLabel && (
        <div className="metric-period">
          {/* 显示周期标签 */}
          {periodLabel}:{' '}
          {/*
            显示周期值。
            同样，如果是数字则格式化。
          */}
          <span>{typeof periodValue === 'number' ? periodValue.toLocaleString() : periodValue}</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard; // 导出组件