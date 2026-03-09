// src/app/analysis/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Spin, Alert } from 'antd'; // 使用 Ant Design 的 Spin 和 Alert 组件
// import DashboardHeader from '@/analysis/components/DashboardHeader'; // 如果需要头部，取消注释
import MetricCard from '@/analysis/components/MetricCard';
import ChartCard from '@/analysis/components/ChartCard';
import type { MetricData, ChartCardData, NameValueData, TimeSeriesData, GeoDistributionData, TopHostData, EChartOption, DashboardData } from '@/analysis/types';
import Icon from '@/analysis/components/common/Icon';
import { faGlobeAsia } from '@fortawesome/free-solid-svg-icons';
import { echarts } from '@/lib/echartsSetup'; // 引入 ECharts 实例
import { fetchDashboardData } from '@/services/analysisApi'; // 引入 API 调用函数
import '../globals.css';
import '@/analysis/styles.css';

/**
 * 数据分析仪表盘主页面组件。
 * 从后端 API 获取数据并渲染。
 */
export default function AnalysisPage() {
    // --- State 定义 ---
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [geoJson, setGeoJson] = useState<any | null>(null);
    const [isMapRegistered, setIsMapRegistered] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // --- 数据获取 Effect ---
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            setError(null);
            setDashboardData(null); // 重置数据
            setGeoJson(null); // 重置 GeoJSON
            setIsMapRegistered(false); // 重置地图注册状态
            console.log("开始加载仪表盘数据和 GeoJSON...");

            try {
                const [fetchedData, geoJsonResponse] = await Promise.all([
                    fetchDashboardData(),
                    fetch('/china.geojson') // 再次确认 public 目录下有 china.geojson
                ]);

                // **增加日志：检查后端返回的地理数据名称**
                console.log("后端返回的原始 geoDistribution 数据:", fetchedData.geoDistribution);
                setDashboardData(fetchedData);
                console.log("仪表盘数据已成功获取。");

                if (!geoJsonResponse.ok) {
                    throw new Error(`加载 china.geojson 失败: ${geoJsonResponse.statusText} (状态码: ${geoJsonResponse.status})`);
                }
                const fetchedGeoJson = await geoJsonResponse.json();

                // **增加日志：检查 GeoJSON 结构和名称属性**
                if (fetchedGeoJson && fetchedGeoJson.features && fetchedGeoJson.features.length > 0) {
                    console.log("加载的 china.geojson 的第一个 feature 结构示例:", fetchedGeoJson.features[0]);
                    // 检查常见的 'name' 属性路径
                    const firstFeatureName = fetchedGeoJson.features[0]?.properties?.name ||
                                             fetchedGeoJson.features[0]?.properties?.NAME ||
                                             fetchedGeoJson.features[0]?.properties?.Name; // 添加更多可能的属性名检查
                    console.log("GeoJSON 中第一个 feature 的 name 属性值:", firstFeatureName || "未找到 'name' 属性");
                    if (!firstFeatureName) {
                        console.warn("警告：在 GeoJSON 的 features[0].properties 中未能自动检测到 'name' 或 'NAME' 或 'Name' 属性。请检查 GeoJSON 文件结构，并可能需要调整 nameMap 或数据源。");
                    }
                } else {
                    console.warn("警告：加载的 GeoJSON 文件无效或不包含 features 数组。");
                    throw new Error("加载的 GeoJSON 文件无效。");
                }

                setGeoJson(fetchedGeoJson);
                console.log("china.geojson 文件已成功加载。");

            } catch (err: any) {
                console.error("加载数据或 GeoJSON 时出错:", err);
                setError(`加载失败: ${err.message}`);
                setDashboardData(null); // 清空数据以防渲染错误
                setGeoJson(null); // 清空 GeoJSON
                setIsLoading(false); // 确定性地结束加载（虽然是失败）
            }
        };

        loadData();
    }, []); // 依赖为空，仅挂载时执行

    // --- 地图注册与状态管理 Effect ---
    useEffect(() => {
        let registrationAttempted = false; // 标记是否尝试过注册

        // 尝试注册地图
        if (geoJson && !isMapRegistered && !registrationAttempted) {
             registrationAttempted = true; // 标记已尝试
            try {
                console.log("尝试注册 ECharts 地图 'china'...");
                echarts.registerMap('china', geoJson);
                setIsMapRegistered(true);
                console.log("ECharts 地图 'china' 注册成功。");
            } catch (regError: any) {
                console.error("注册 ECharts 地图 'china' 失败:", regError);
                setError(prevError => prevError || `地图组件初始化失败: ${regError.message}`); // 保留之前的错误信息（如果有）
                setIsMapRegistered(false); // 标记注册失败
            }
        }

        // 更新最终加载状态: 必须在数据获取完成 *且* 地图注册尝试完成后进行
        // 只有当 dashboardData 和 geoJson 都不是 null (表示加载成功) 且地图注册完成或失败后，才停止 loading
        // 或者当 error 已经被设置时，也停止 loading
        if (error) {
            if (isLoading) setIsLoading(false); // 如果出错，停止 loading
        } else if (dashboardData !== null && geoJson !== null) {
             // 数据和 GeoJSON 都加载完成
             if (isMapRegistered || (!isMapRegistered && registrationAttempted)) {
                 // 并且地图已注册，或者尝试注册但失败了
                 if (isLoading) setIsLoading(false); // 结束 loading
             }
        }

    }, [geoJson, isMapRegistered, dashboardData, error, isLoading]); // 添加 isLoading 到依赖项，以便正确更新它


    // --- ECharts 配置项生成函数 ---
    const getChartOptions = useCallback(() => {
        // **确保 dashboardData 和 isMapRegistered 都准备好**
        if (!dashboardData || !isMapRegistered) {
             console.log("数据或地图尚未准备好，不生成图表配置。");
             return null;
        }
        console.log("数据和地图已准备好，开始生成图表配置...");


        // --- 其他图表配置项 (保持不变) ---
        const speciesTaxonomyOption: EChartOption = { /* ... */
            tooltip: { trigger: 'item', formatter: '{b} : {c} ({d}%)' },
            legend: { top: 'bottom', left: 'center', itemWidth: 14, itemHeight: 14, textStyle: { fontSize: 11 } },
            series: [{
                name: '分类层级', type: 'pie', radius: ['40%', '70%'], avoidLabelOverlap: false,
                itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
                label: { show: false, position: 'center' },
                emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
                labelLine: { show: false },
                data: dashboardData.speciesTaxonomy,
                color: ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE', '#3BA272']
            }]};
        const speciesStatusOption: EChartOption = { /* ... */
            tooltip: { trigger: 'item', formatter: '{b} : {c} ({d}%)' },
            legend: { top: 'bottom', left: 'center', itemWidth: 14, itemHeight: 14, textStyle: { fontSize: 11 } },
            series: [{
                name: '确认状态', type: 'pie', radius: '65%', center: ['50%', '50%'],
                // @ts-ignore
                data: [...dashboardData.speciesStatus].sort((a, b) => a.value - b.value),
                roseType: 'radius',
                label: { color: '#333', formatter: '{d}%', fontSize: 10 },
                labelLine: { length: 4, length2: 8 },
                itemStyle: { borderRadius: 5 },
                color: ['#91CC75', '#FAC858', '#EE6666']
            }]};
        const speciesGrowthOption: EChartOption = { /* ... */
            tooltip: { trigger: 'axis' },
            xAxis: { type: 'category', boundaryGap: false, data: dashboardData.speciesGrowth.dates, axisLabel: { fontSize: 10 } },
            yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
            grid: { left: '3%', right: '5%', bottom: '3%', containLabel: true },
            series: [{
                name: '物种数量', type: 'line', smooth: true,
                areaStyle: {
                    opacity: 0.3,
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(131, 191, 246, 0.8)' }, { offset: 1, color: 'rgba(24, 141, 240, 0.1)' }])
                },
                data: dashboardData.speciesGrowth.counts,
                lineStyle: { color: '#5470C6', width: 2 }, itemStyle: { color: '#5470C6' }
            }]};
        const topHostsOption: EChartOption = { /* ... */
            tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
            grid: { left: '3%', right: '10%', bottom: '3%', containLabel: true },
            xAxis: { type: 'value', boundaryGap: [0, 0.01], axisLabel: { fontSize: 10 } },
            yAxis: {
                type: 'category', data: [...dashboardData.topHosts.names].reverse(),
                axisLabel: { fontSize: 10, interval: 0, formatter: (value: string) => value.length > 12 ? value.substring(0, 12) + '...' : value }
            },
            series: [{
                name: '关联物种数', type: 'bar', data: [...dashboardData.topHosts.counts].reverse(),
                itemStyle: { color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{ offset: 0, color: 'rgba(131, 191, 246, 0.7)' }, { offset: 1, color: 'rgba(24, 141, 240, 1)' }]), borderRadius: [0, 5, 5, 0] },
                label: { show: true, position: 'right', color: '#333', fontSize: 10 }
            }]};
        const referenceGrowthOption: EChartOption = { /* ... */
            tooltip: { trigger: 'axis' },
            xAxis: { type: 'category', boundaryGap: false, data: dashboardData.referenceGrowth.dates, axisLabel: { fontSize: 10 } },
            yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
            grid: { left: '3%', right: '5%', bottom: '3%', containLabel: true },
            series: [{
                name: '文献数量', type: 'line', smooth: true,
                areaStyle: { opacity: 0.3, color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(159, 236, 162, 0.8)' }, { offset: 1, color: 'rgba(72, 198, 141, 0.1)' }]) },
                data: dashboardData.referenceGrowth.counts,
                lineStyle: { color: '#50E3C2', width: 2 }, itemStyle: { color: '#50E3C2' }
            }]};
        const referenceTypeOption: EChartOption = { /* ... */
            tooltip: { trigger: 'item', formatter: '{b} : {c} ({d}%)' },
            legend: { orient: 'vertical', left: 'left', top: 'center', itemWidth: 10, itemHeight: 10, textStyle: { fontSize: 10 } },
            series: [{
                name: '文献类型', type: 'pie', radius: ['45%', '70%'], center: ['65%', '50%'],
                avoidLabelOverlap: true, label: { show: false, position: 'center' },
                emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
                labelLine: { show: false }, data: dashboardData.referenceTypes,
                color: ['#4fc3f7', '#ffb74d', '#aed581', '#ba68c8', '#dce775', '#ff8a65']
            }]};
        const fileTypeOption: EChartOption = { /* ... */
            tooltip: { trigger: 'item', formatter: '{b} : {c} ({d}%)' },
            legend: { top: 'bottom', left: 'center', itemWidth: 14, itemHeight: 14, textStyle: { fontSize: 11 } },
            series: [{
                name: '文件类型', type: 'pie', radius: ['40%', '65%'],
                avoidLabelOverlap: true,
                itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 1 },
                label: { show: true, position: 'inside', formatter: '{d}%', color: '#fff', fontSize: 10, textShadow: '1px 1px 2px rgba(0,0,0,0.3)' },
                emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' }, itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.3)' } },
                data: dashboardData.fileTypes,
                color: ['#f06292', '#7986cb', '#ffee58', '#bdbdbd']
            }]};

        // --- 地理分布图表配置 - 重点关注 layoutCenter 和 layoutSize ---
        const geoDistributionOption: EChartOption = {
            tooltip: {
                trigger: 'item',
                formatter: (params: any) => {
                    const value = params.value;
                    return `${params.name}: ${typeof value === 'number' ? value + ' 种' : 'N/A'}`;
                }
            },
            visualMap: {
                min: 0,
                 max: Math.max(1, ...dashboardData.geoDistribution.map(d => typeof d.value === 'number' ? d.value : 0)) || 100,
                left: '5%',
                bottom: '5%',
                calculable: true,
                inRange: {
                    color: ['#E0F3F8', '#ABD9E9', '#74ADD1', '#4575B4', '#313695'].reverse()
                },
                text: ['高', '低'],
                textStyle: { fontSize: 10, color: '#555' }
            },
            toolbox: {
                show: true, orient: 'vertical', left: 'right', top: 'center',
                feature: { restore: {}, saveAsImage: {} }, iconStyle: { borderColor: '#666' }
            },
            series: [{
                name: '物种地理分布',
                type: 'map',
                map: 'china',
                roam: true, // 允许缩放和平移
                label: { show: false },
                emphasis: {
                    label: { show: true, color: '#000', fontSize: 10 },
                    itemStyle: { areaColor: '#fdd835' }
                },
                itemStyle: {
                    areaColor: '#f7f7f7',
                    borderColor: '#ccc',
                    borderWidth: 0.5
                },
                nameMap: { // **确保这个映射仍然是正确的**
                    '新疆': '新疆维吾尔自治区',
                    '内蒙古': '内蒙古自治区',
                    '西藏': '西藏自治区',
                    '广西': '广西壮族自治区',
                    '宁夏': '宁夏回族自治区',
                    '香港': '香港特别行政区',
                    '澳门': '澳门特别行政区',
                },
                // **核心修改：添加 layoutCenter 和 layoutSize**
                layoutCenter: ['50%', '50%'], // 将地图中心对齐容器中心
                // 设置地图大小。'100%' 会使地图大小等于容器大小（受 aspectScale 影响）。
                // 可以尝试 '95%' 或 '100%' 看看效果。
                // 如果设置为 100% 后地图被不希望地拉伸，可以考虑移除 aspectScale 或调整其值。
                layoutSize: '100%',
                // aspectScale: 0.9, // 这个值会影响地图的默认长宽比，如果 layoutSize 设置为 100% 后地图变形，可以尝试注释掉或调整此值

                data: dashboardData.geoDistribution.map(item => ({
                    name: item.name,
                    value: typeof item.value === 'number' ? item.value : 0
                })),
            }]
        };
        // --- 地理分布图表配置结束 ---


        // --- 整合图表数据 ---
        const chartCards: ChartCardData[] = [
            { id: 'taxonomy', icon: 'sitemap', title: '物种分类层级分布', chartOption: speciesTaxonomyOption },
            { id: 'status', icon: 'check-circle', title: '物种确认状态', chartOption: speciesStatusOption },
            { id: 'species-growth', icon: 'chart-line', title: '物种收录增长趋势', chartOption: speciesGrowthOption },
            { id: 'hosts', icon: 'bug', title: 'Top 5 寄主植物', chartOption: topHostsOption },
            { id: 'ref-growth', icon: 'chart-area', title: '参考文献增长趋势', chartOption: referenceGrowthOption },
            { id: 'ref-type', icon: 'tags', title: '参考文献类型', chartOption: referenceTypeOption },
            { id: 'file-type', icon: 'file-alt', title: '关联文件类型', chartOption: fileTypeOption },
        ];

        // 地理分布图单独处理
        // **现在我们只在 isMapRegistered 为 true 时才尝试创建 geoCard**
        const geoCard: ChartCardData | null = isMapRegistered ? {
            id: 'geo',
            icon: 'globe-asia',
            title: '物种地理分布 (中国)',
            chartOption: geoDistributionOption, // 使用带有 nameMap 的配置
            className: 'large-card',
        } : null;

         // **增加日志：最终生成的图表配置对象**
         console.log("最终生成的 geoDistributionOption:", geoDistributionOption);

        return { metrics: dashboardData.metrics, chartCards, geoCard };

    }, [dashboardData, isMapRegistered]); // 依赖项现在只有 data 和 map 注册状态


    // --- 渲染逻辑 ---
    const renderContent = () => {
        // 1. 正在加载
        if (isLoading) {
            return (
                <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2em' }}>
                    <Spin size="large"/>
                </div>
            );
        }

        // 2. 加载出错
        if (error) {
            // **如果错误与地图注册有关，仍然尝试渲染其他图表**
            const options = getChartOptions(); // 尝试获取其他图表数据
            if (options && dashboardData && !isMapRegistered) {
                // 地图加载失败，但其他数据正常
                return (
                     <>
                        <Alert message="地图加载失败" description={error} type="warning" showIcon style={{marginBottom: '20px'}}/>
                        {/* 渲染其他图表 */}
                        <section className="metrics-row">{options.metrics.map(metric => (<MetricCard key={metric.id} metric={metric} />))}</section>
                        <section className="charts-row-triple"><ChartCard chartData={options.chartCards[0]} /><ChartCard chartData={options.chartCards[1]} /><ChartCard chartData={options.chartCards[2]} /></section>
                        <section className="charts-row-double">
                             {/* 地图占位符 */}
                             <div className="card chart-card large-card">
                                <div className="card-header"><Icon icon={faGlobeAsia} className="icon" /><span>物种地理分布 (加载失败)</span></div>
                                <div className="chart-container tall-chart" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', border: '1px dashed #ccc', minHeight: '300px' }}>地图加载失败。</div>
                            </div>
                            <ChartCard chartData={options.chartCards[3]} />
                        </section>
                        <section className="charts-row-triple"><ChartCard chartData={options.chartCards[4]} /><ChartCard chartData={options.chartCards[5]} /><ChartCard chartData={options.chartCards[6]} /></section>
                    </>
                );
            } else {
                 // 其他错误（如数据获取失败）
                 return (
                    <div style={{ padding: '20px' }}>
                        <Alert message="加载错误" description={error} type="error" showIcon />
                    </div>
                 );
            }
        }

        // 3. 数据为空 (理论上应该在 error 中处理了)
        if (!dashboardData) {
            return (
                <div style={{ padding: '20px' }}>
                    <Alert message="无数据" description="未能获取到有效的仪表盘数据。" type="warning" showIcon />
                </div>
            );
        }

        // 4. 成功加载，但 getChartOptions 返回 null (地图未注册时发生)
         const chartOptions = getChartOptions();
        if (!chartOptions) {
             // 这种情况理论上不应该发生，因为 isLoading 会保持 true 直到地图注册完成或失败
             // 但作为防御性编程，添加一个提示
             return (
                <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2em' }}>
                    <Spin size="large" />
                 </div>
             );
        }

        // 5. 成功渲染
        const { metrics, chartCards, geoCard } = chartOptions;

        return (
            <>
                {/* 第一行：指标卡片 */}
                <section className="metrics-row">
                    {metrics.map(metric => (
                        <MetricCard key={metric.id} metric={metric} />
                    ))}
                </section>

                {/* 第二行：物种分析图表 */}
                <section className="charts-row-triple">
                    <ChartCard chartData={chartCards[0]} />
                    <ChartCard chartData={chartCards[1]} />
                    <ChartCard chartData={chartCards[2]} />
                </section>

                {/* 第三行：地理分布和宿主分析 */}
                <section className="charts-row-double">
                    {/* 地理分布地图 - 条件渲染 */}
                    {geoCard ? ( // **现在 geoCard 只有在地图注册成功时才会有值**
                        <ChartCard chartData={geoCard} />
                    ) : (
                        // 地图未准备好时的占位符 (理论上在 error 处理中覆盖了，但保留以防万一)
                        <div className="card chart-card large-card">
                            <div className="card-header">
                                <Icon icon={faGlobeAsia} className="icon" />
                                <span>物种地理分布 (加载中...)</span>
                            </div>
                            <div className="chart-container tall-chart" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', border: '1px dashed #ccc', minHeight: '300px' }}>
                                地图组件准备中...
                            </div>
                        </div>
                    )}
                    {/* Top 5 宿主 */}
                    <ChartCard chartData={chartCards[3]} />
                </section>

                {/* 第四行：文献和内容分析 */}
                <section className="charts-row-triple">
                    <ChartCard chartData={chartCards[4]} />
                    <ChartCard chartData={chartCards[5]} />
                    <ChartCard chartData={chartCards[6]} />
                </section>
            </>
        );
    };

    // --- 最终页面渲染 ---
    return (
        <div className="dashboard-container">
            {/* <DashboardHeader /> */}
            <main className="dashboard-content">
                {renderContent()}
            </main>
        </div>
    );
}