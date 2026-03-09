// src/graph/components/common/EChartBase.tsx
import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart, PieChart, GraphChart } from 'echarts/charts'; // 按需引入图表类型
import {
    TitleComponent, TooltipComponent, GridComponent, LegendComponent, ToolboxComponent // 按需引入组件
} from 'echarts/components';
import { debounce } from 'lodash-es'; // 使用 lodash 的 debounce

// 注册必须的组件
echarts.use([
    TitleComponent, TooltipComponent, GridComponent, LegendComponent, ToolboxComponent,
    BarChart, PieChart, GraphChart, // 注册图表类型
    CanvasRenderer // 使用 Canvas 渲染器
]);

interface EChartBaseProps {
    option: any;      // ECharts 配置项
    style?: React.CSSProperties;        // 图表容器样式
    className?: string;                 // 图表容器 CSS 类名
    theme?: string | object;            // ECharts 主题
    showLoading?: boolean;              // 是否显示加载动画
    onEvents?: Record<string, (params: any) => void>; // 事件处理函数映射
}

// 定义暴露给父组件的 Ref 方法类型
export interface EChartBaseRef {
    getInstance: () => echarts.ECharts | undefined;
    resize: () => void;
}

/**
 * 通用 ECharts 图表封装组件
 * 使用 useImperativeHandle 暴露 ECharts 实例和 resize 方法
 */
const EChartBase = forwardRef<EChartBaseRef, EChartBaseProps>(
    ({ option, style, className, theme, showLoading, onEvents }, ref) => {
        const chartRef = useRef<HTMLDivElement>(null); // 用于引用图表容器 DOM
        const chartInstanceRef = useRef<echarts.ECharts | undefined>(undefined); // Used to store ECharts instance

        // 防抖的 resize 函数
        const debouncedResize = useRef(
            debounce(() => {
                chartInstanceRef.current?.resize();
            }, 300) // 300ms 防抖延迟
        );

        // 初始化图表
        useEffect(() => {
            if (chartRef.current) {
                // 销毁旧实例 (如果存在)
                chartInstanceRef.current?.dispose();
                // 初始化新实例
                chartInstanceRef.current = echarts.init(chartRef.current, theme, { renderer: 'canvas' });

                // 绑定事件监听器
                if (onEvents) {
                    Object.keys(onEvents).forEach(eventName => {
                        chartInstanceRef.current?.on(eventName, params => {
                            onEvents[eventName](params);
                        });
                    });
                }

                // 添加 resize 监听
                window.addEventListener('resize', debouncedResize.current);
            }

            // 清理函数：组件卸载时销毁实例并移除监听器
            return () => {
                debouncedResize.current.cancel(); // 取消防抖
                window.removeEventListener('resize', debouncedResize.current);
                chartInstanceRef.current?.dispose();
            };
        }, [theme, onEvents]); // 依赖 theme 和 onEvents，当它们改变时重新初始化

        // 更新图表配置或显示加载状态
        useEffect(() => {
            if (chartInstanceRef.current) {
                if (showLoading) {
                    chartInstanceRef.current.showLoading();
                } else {
                    chartInstanceRef.current.hideLoading();
                    // 'true' 表示不合并，完全替换旧的 option
                    // 'false' 表示合并，避免不必要的动画和重绘
                    chartInstanceRef.current.setOption(option, true);
                }
            }
        }, [option, showLoading]); // 依赖 option 和 showLoading

        // 使用 useImperativeHandle 暴露方法给父组件
        useImperativeHandle(ref, () => ({
            getInstance: () => chartInstanceRef.current,
            resize: () => {
                chartInstanceRef.current?.resize();
            }
        }));

        return (
            <div
                ref={chartRef}
                style={{ width: '100%', height: '100%', ...style }} // 确保容器有尺寸
                className={className}
            />
        );
    }
);

EChartBase.displayName = 'EChartBase'; // 设置 displayName 便于调试

export default EChartBase;

// 注意: 需要安装 lodash-es 和 @types/lodash-es
// npm install lodash-es @types/lodash-es
// 或者
// yarn add lodash-es @types/lodash-es