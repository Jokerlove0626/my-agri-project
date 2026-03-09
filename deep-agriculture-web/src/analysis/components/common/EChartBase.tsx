// src/analysis/components/common/EChartBase.tsx
"use client";

import React, { useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { echarts } from '@/lib/echartsSetup';
import type { EChartsOption, ECharts } from 'echarts';
//@ts-ignore
import _debounce from 'lodash/debounce'; // 引入 lodash 的 debounce

interface EChartBaseProps {
  option: EChartsOption;
  style?: React.CSSProperties;
  className?: string;
  theme?: string | object;
  showLoading?: boolean;
}

const EChartBase: React.FC<EChartBaseProps> = ({
  option,
  style = { width: '100%', height: '300px' }, // 提供一个默认的最小高度
  className,
  theme,
  showLoading,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<ECharts | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // --- 销毁图表实例 ---
  const disposeChart = useCallback(() => {
    // 断开 ResizeObserver 的监听
    if (resizeObserverRef.current && chartRef.current) {
        resizeObserverRef.current.unobserve(chartRef.current);
    }
    if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
    }
    // 销毁 ECharts 实例
    if (chartInstanceRef.current) {
      console.log('Disposing ECharts instance:', chartRef.current?.id || '');
      chartInstanceRef.current.dispose();
      chartInstanceRef.current = null;
    }
  }, []);

  // --- 初始化图表实例 ---
  const initChart = useCallback(() => {
    if (!chartRef.current) {
      console.warn('Chart container ref is not available during init.');
      return;
    }

    const container = chartRef.current;
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    const elementId = container.id || 'unknown-chart';

    console.log(`Attempting to initialize chart [${elementId}] with container dimensions: ${width}x${height}`);

    // 检查容器尺寸是否有效，避免在 display: none 或 0x0 尺寸下初始化
    if (width > 0 && height > 0) {
      // 销毁可能存在的旧实例
      disposeChart();

      try {
        console.log(`Initializing ECharts instance for [${elementId}]...`);
        const chart = echarts.init(container, theme);
        //@ts-ignore
        chartInstanceRef.current = chart;
        console.log(`ECharts instance initialized successfully for [${elementId}].`);

        // 设置初始选项
        if (option) {
            console.log(`Setting initial options for [${elementId}].`);
            chart.setOption(option, true); // notMerge=true, 清除旧配置
        }

        // 处理加载状态
        if (showLoading) {
            chart.showLoading();
        }

        // 启动 ResizeObserver 监听容器尺寸变化
        if (window.ResizeObserver) {
            resizeObserverRef.current = new ResizeObserver(_debounce(() => { // 使用 debounce 防止频繁触发
                if (chartInstanceRef.current && chartRef.current) {
                    const currentWidth = chartRef.current.offsetWidth;
                    const currentHeight = chartRef.current.offsetHeight;
                    // 只有在容器仍然可见且尺寸有效时才resize
                    if (currentWidth > 0 && currentHeight > 0) {
                        console.log(`Resizing chart [${elementId}] due to container size change: ${currentWidth}x${currentHeight}`);
                        try {
                          chartInstanceRef.current.resize();
                        } catch(resizeError){
                          console.error(`Error resizing chart [${elementId}]:`, resizeError);
                        }
                    } else {
                       console.warn(`Skipping resize for [${elementId}] as container dimensions are zero.`);
                    }
                }
            }, 300)); // 300ms 防抖延迟
            resizeObserverRef.current.observe(container);
            console.log(`ResizeObserver started for [${elementId}].`);
        } else {
            // Fallback for older browsers (less efficient)
            console.warn(`ResizeObserver not supported. Falling back to window resize listener for [${elementId}].`);
            window.addEventListener('resize', debouncedResizeHandler);
        }

      } catch (error) {
        console.error(`Error initializing ECharts for [${elementId}]:`, error);
        // 可以在容器内显示错误信息
        container.innerHTML = `<p style="color: red; text-align: center; padding: 10px;">图表加载失败</p>`;
      }
    } else {
      console.warn(`Chart container [${elementId}] has zero dimensions (${width}x${height}). Initialization deferred.`);
      // 可以考虑稍后重试，但更推荐确保容器在挂载时有有效尺寸
    }
  }, [theme, option, showLoading, disposeChart]); // 包含 disposeChart 作为依赖

  // --- Fallback Resize Handler (if ResizeObserver is not available) ---
  const debouncedResizeHandler = useCallback(_debounce(() => {
      if (chartInstanceRef.current && chartRef.current && chartRef.current.offsetWidth > 0 && chartRef.current.offsetHeight > 0) {
          console.log(`Resizing chart [${chartRef.current.id || 'unknown-chart'}] due to window resize.`);
          try{
            chartInstanceRef.current.resize();
          } catch(resizeError) {
            console.error(`Error resizing chart [${chartRef.current.id || 'unknown-chart'}] on window resize:`, resizeError);
          }
      }
  }, 300), []); // Debounce window resize


  // --- Effect: 初始化和销毁 ---
  useEffect(() => {
    // 尝试初始化图表
    // 使用 setTimeout 确保 DOM 渲染完成且尺寸计算完毕
    const timerId = setTimeout(() => {
        initChart();
    }, 50); // 短暂延迟，给浏览器渲染时间

    // 清理函数：组件卸载时销毁图表和移除监听器
    return () => {
        clearTimeout(timerId);
        disposeChart(); // 调用统一的销毁逻辑
        if (!window.ResizeObserver) { // 如果使用的是 fallback
            window.removeEventListener('resize', debouncedResizeHandler);
        }
    };
  }, [initChart, disposeChart, debouncedResizeHandler]); // 依赖 initChart 和 disposeChart


  // --- Effect: 更新选项 ---
  useLayoutEffect(() => {
    // 仅当图表实例存在且选项发生变化时更新
    if (chartInstanceRef.current && option) {
        const elementId = chartRef.current?.id || 'unknown-chart';
        console.log(`Updating options for chart [${elementId}].`);
        try {
            chartInstanceRef.current.setOption(option, true); // notMerge=true 保证应用全新配置

            // 更新加载状态
            if (showLoading) {
                chartInstanceRef.current.showLoading();
            } else {
                chartInstanceRef.current.hideLoading();
            }
        } catch (error) {
            console.error(`Error setting options for chart [${elementId}]:`, error);
        }
    }
  }, [option, showLoading]); // 依赖 option 和 showLoading

  // 生成唯一 ID 用于调试
  const elementId = `echart-${React.useId()}`;

  return (
    <div
      id={elementId}
      ref={chartRef}
      className={className}
      style={{ ...style, position: 'relative' }} // 确保有 position 且应用传入的 style
    />
  );
};

export default EChartBase;