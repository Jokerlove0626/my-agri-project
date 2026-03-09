document.addEventListener('DOMContentLoaded', function () {
    console.log('DeepForest Dashboard Enhanced Initialized - Populating charts');

    // --- Mock Data (Replace with actual data fetching) ---
    const mockData = {
        totalSpeciesCount: 1853,
        totalReferenceCount: 12450,
        newReferencesWeekly: 150,
        todayQACount: 215,
        qaCount7Days: 1488,
        totalFileSizeGB: 88.5,
        totalFileCount: 4320,
        speciesTaxonomy: [
            { value: 980, name: '昆虫纲 (Insecta)' },
            { value: 350, name: '蛛形纲 (Arachnida)' },
            { value: 180, name: '线虫门 (Nematoda)' },
            { value: 150, name: '真菌界 (Fungi)' },
            { value: 93, name: '其他' },
        ],
        speciesStatus: [
            { value: 1500, name: '已确认' },
            { value: 253, name: '待审核' },
            { value: 100, name: '有疑问' },
        ],
        speciesGrowth: {
            dates: ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06', '2024-07'],
            counts: [850, 920, 1100, 1350, 1580, 1750, 1853]
        },
        geoDistribution: [ // Mock data for China map
            { name: '新疆', value: Math.round(Math.random() * 100) }, { name: '西藏', value: Math.round(Math.random() * 50) },
            { name: '内蒙古', value: Math.round(Math.random() * 150) }, { name: '青海', value: Math.round(Math.random() * 80) },
            { name: '四川', value: Math.round(Math.random() * 250) }, { name: '黑龙江', value: Math.round(Math.random() * 180) },
            { name: '甘肃', value: Math.round(Math.random() * 120) }, { name: '云南', value: Math.round(Math.random() * 300) },
            { name: '广西', value: Math.round(Math.random() * 200) }, { name: '湖南', value: Math.round(Math.random() * 220) },
            { name: '陕西', value: Math.round(Math.random() * 130) }, { name: '广东', value: Math.round(Math.random() * 280) },
            { name: '吉林', value: Math.round(Math.random() * 160) }, { name: '河北', value: Math.round(Math.random() * 140) },
            { name: '湖北', value: Math.round(Math.random() * 210) }, { name: '贵州', value: Math.round(Math.random() * 170) },
            { name: '山东', value: Math.round(Math.random() * 190) }, { name: '江西', value: Math.round(Math.random() * 150) },
            { name: '河南', value: Math.round(Math.random() * 160) }, { name: '辽宁', value: Math.round(Math.random() * 170) },
            { name: '山西', value: Math.round(Math.random() * 110) }, { name: '安徽', value: Math.round(Math.random() * 180) },
            { name: '福建', value: Math.round(Math.random() * 230) }, { name: '浙江', value: Math.round(Math.random() * 240) },
            { name: '江苏', value: Math.round(Math.random() * 260) }, { name: '重庆', value: Math.round(Math.random() * 190) },
            { name: '宁夏', value: Math.round(Math.random() * 70) }, { name: '海南', value: Math.round(Math.random() * 100) },
            { name: '台湾', value: Math.round(Math.random() * 90) }, { name: '北京', value: Math.round(Math.random() * 50) },
            { name: '天津', value: Math.round(Math.random() * 40) }, { name: '上海', value: Math.round(Math.random() * 60) },
            { name: '香港', value: Math.round(Math.random() * 30) }, { name: '澳门', value: Math.round(Math.random() * 20) }
        ],
        topHosts: {
            names: ['杨树 (Populus)', '松树 (Pinus)', '柳树 (Salix)', '苹果 (Malus)', '玉米 (Zea mays)'],
            counts: [350, 280, 190, 150, 120]
        },
        referenceGrowth: {
            dates: ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06', '2024-07'],
            counts: [8000, 8500, 9200, 10100, 11000, 11800, 12450]
        },
        referenceTypes: [
            { value: 4500, name: '期刊文章' }, { value: 3200, name: '会议论文' },
            { value: 1800, name: '书籍章节' }, { value: 1500, name: '技术报告' },
            { value: 1450, name: '其他' },
        ],
        fileTypes: [
            { value: 2800, name: 'PDF' }, { value: 950, name: 'DOC/DOCX' },
            { value: 450, name: 'JPG/PNG' }, { value: 120, name: '其他' },
        ]
    };

    // --- Update KPIs ---
    document.getElementById('totalSpeciesCount').textContent = mockData.totalSpeciesCount.toLocaleString();
    document.getElementById('totalReferenceCount').textContent = mockData.totalReferenceCount.toLocaleString();
    document.getElementById('newReferencesWeekly').textContent = mockData.newReferencesWeekly;
    document.getElementById('todayQACount').textContent = mockData.todayQACount;
    document.getElementById('qaCount7Days').textContent = mockData.qaCount7Days.toLocaleString();
    document.getElementById('totalFileSize').textContent = mockData.totalFileSizeGB.toFixed(1);
    document.getElementById('totalFileCount').textContent = mockData.totalFileCount.toLocaleString();


    // --- ECharts Instances Holder ---
    const charts = {};

    // --- Initialize Charts Function ---
    function initChart(chartId, option) {
        const chartDom = document.getElementById(chartId);
        if (!chartDom) {
            console.error(`Chart container not found: ${chartId}`);
            return null;
        }
        // Dispose existing instance if any to prevent memory leaks on re-init
        if (charts[chartId]) {
            charts[chartId].dispose();
        }
        try {
            const myChart = echarts.init(chartDom);
            myChart.setOption(option);
            charts[chartId] = myChart; // Store instance
            console.log(`Chart initialized: ${chartId}`);
            return myChart;
        } catch (error) {
            console.error(`Error initializing chart ${chartId}:`, error);
            chartDom.innerHTML = `<p style="color: red; text-align: center; padding: 10px;">图表加载失败</p>`; // Display error in the container
            return null;
        }
    }


    // --- Chart Options ---

    // 1. Species Taxonomy Chart (Pie)
    const speciesTaxonomyOption = {
        tooltip: { trigger: 'item', formatter: '{b} : {c} ({d}%)' },
        legend: { top: 'bottom', left: 'center', itemWidth: 14, itemHeight: 14, textStyle: { fontSize: 11 } },
        series: [{
            name: '分类层级', type: 'pie', radius: ['40%', '70%'], avoidLabelOverlap: false,
            itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
            label: { show: false, position: 'center' },
            emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } }, // Smaller emphasis font
            labelLine: { show: false },
            data: mockData.speciesTaxonomy,
            color: ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE', '#3BA272', '#FC8452', '#9A60B4', '#EA7CCC'] // More colors if needed
        }]
    };
    initChart('speciesTaxonomyChart', speciesTaxonomyOption);

    // 2. Species Status Chart (Pie)
    const speciesStatusOption = {
        tooltip: { trigger: 'item', formatter: '{b} : {c} ({d}%)' },
        legend: { top: 'bottom', left: 'center', itemWidth: 14, itemHeight: 14, textStyle: { fontSize: 11 } },
        series: [{
            name: '确认状态', type: 'pie', radius: '65%', center: ['50%', '50%'], // Slightly smaller radius
            data: mockData.speciesStatus.sort((a, b) => a.value - b.value),
            roseType: 'radius',
            label: { color: '#333', formatter: '{d}%', fontSize: 10 }, // Only percentage inside
            labelLine: { length: 4, length2: 8 }, // Shorter lines
            itemStyle: { borderRadius: 5 },
            color: ['#91CC75', '#FAC858', '#EE6666'] // Green, Yellow, Red
        }]
    };
    initChart('speciesStatusChart', speciesStatusOption);

    // 3. Species Growth Chart (Line)
    const speciesGrowthOption = {
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', boundaryGap: false, data: mockData.speciesGrowth.dates, axisLabel: { fontSize: 10 } },
        yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
        grid: { left: '4%', right: '5%', bottom: '5%', containLabel: true }, // Adjust grid
        series: [{
            name: '物种数量', type: 'line', stack: 'Total', smooth: true,
            areaStyle: { opacity: 0.3, color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#83bff6' }, { offset: 1, color: '#188df0' }]) },
            data: mockData.speciesGrowth.counts,
            lineStyle: { color: '#5470C6' }, itemStyle: { color: '#5470C6' }
        }]
    };
    initChart('speciesGrowthChart', speciesGrowthOption);

     // 4. Geographic Distribution Map (Using China Map) - CONFIRMED
     const geoDistributionOption = {
        tooltip: { trigger: 'item', showDelay: 0, transitionDuration: 0.2, formatter: '{b}: {c} 种' },
        visualMap: {
            left: '5%', bottom: '5%', min: 0, max: 300, // Adjust max based on data
            inRange: { color: ['#E0F3F8', '#ABD9E9', '#74ADD1', '#4575B4', '#313695'].reverse() }, // Gradient blue
            text: ['高', '低'], calculable: true, textStyle: { fontSize: 10 }
        },
        toolbox: { show: true, orient: 'vertical', left: 'right', top: 'center', feature: { restore: {}, saveAsImage: {} }, iconStyle: { borderColor: '#666' } },
        series: [{
            name: '物种分布', type: 'map', map: 'china', // Ensure 'china.js' is loaded
            roam: true, // Allow zooming and panning
            label: { show: false }, // Hide labels by default
            emphasis: { label: { show: true, color: '#000', fontSize: 10 }, itemStyle: { areaColor: '#FBCB0A' } }, // Highlight color
            data: mockData.geoDistribution
        }]
    };
    initChart('geoDistributionMap', geoDistributionOption);


    // 5. Top Hosts Chart (Bar) - CONFIRMED
    const topHostsOption = {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '3%', right: '10%', bottom: '3%', containLabel: true }, // Ensure space for labels
        xAxis: { type: 'value', boundaryGap: [0, 0.01], axisLabel: { fontSize: 10 } },
        yAxis: { type: 'category', data: mockData.topHosts.names.slice().reverse(), // Use slice() to avoid modifying original data
                 axisLabel: { fontSize: 10, interval: 0 } // Show all labels
               },
        series: [{
            name: '关联物种数', type: 'bar', data: mockData.topHosts.counts.slice().reverse(), // Use slice()
            itemStyle: { color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{ offset: 0, color: '#83bff6' }, { offset: 1, color: '#188df0' }]), borderRadius: [0, 5, 5, 0] },
            label: { show: true, position: 'right', color: '#333', fontSize: 10 }
        }]
    };
    initChart('topHostsChart', topHostsOption);


    // 6. Reference Growth Chart (Line) - CONFIRMED
    const referenceGrowthOption = {
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', boundaryGap: false, data: mockData.referenceGrowth.dates, axisLabel: { fontSize: 10 } },
        yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
        grid: { left: '4%', right: '5%', bottom: '5%', containLabel: true }, // Adjust grid
        series: [{
            name: '文献数量', type: 'line', smooth: true,
            areaStyle: { opacity: 0.3, color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#9FECA2' }, { offset: 1, color: '#48C68D' }]) },
            data: mockData.referenceGrowth.counts,
            lineStyle: { color: '#50E3C2' }, itemStyle: { color: '#50E3C2' }
        }]
    };
    initChart('referenceGrowthChart', referenceGrowthOption);

    // 7. Reference Type Chart (Pie) - CONFIRMED
    const referenceTypeOption = {
        tooltip: { trigger: 'item', formatter: '{b} : {c} ({d}%)' },
        legend: { orient: 'vertical', left: 'left', top: 'center', itemWidth: 10, itemHeight: 10, textStyle: { fontSize: 10 } }, // Smaller legend items
        series: [{
            name: '文献类型', type: 'pie', radius: ['45%', '70%'], center: ['65%', '50%'], // Doughnut, adjust center
            data: mockData.referenceTypes,
            avoidLabelOverlap: true,
            label: { show: false, position: 'center' },
             emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
            labelLine: { show: false },
        }]
    };
    initChart('referenceTypeChart', referenceTypeOption);

    // 8. File Type Chart (Pie) - CONFIRMED
     const fileTypeOption = {
        tooltip: { trigger: 'item', formatter: '{b} : {c} ({d}%)' },
        legend: { top: 'bottom', left: 'center', itemWidth: 14, itemHeight: 14, textStyle: { fontSize: 11 } },
        series: [{
            name: '文件类型', type: 'pie', radius: ['45%', '65%'], // Doughnut
            avoidLabelOverlap: true,
            itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 1 },
            label: { show: true, formatter: '{d}%', position: 'inside', color: '#fff', fontSize: 10 }, // Label inside slices
            emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' }, itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.3)' } },
            // labelLine: { show: false }, // No line needed if label inside
            data: mockData.fileTypes,
            color: ['#f5a623', '#f8e71c', '#7ed321', '#9b9b9b'] // Orange, Yellow, Green, Grey
        }]
    };
    initChart('fileTypeChart', fileTypeOption);


    // --- Clock ---
    function updateTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        document.getElementById('currentTime').textContent = `${hours}:${minutes}:${seconds}`;
    }
    setInterval(updateTime, 1000);
    updateTime(); // Initial call


    // --- Resize Listener ---
    // Debounce function to limit resize calls
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    const debouncedResize = debounce(() => {
        console.log('Resizing charts...');
        Object.values(charts).forEach(chart => {
            if (chart && typeof chart.resize === 'function') {
                try {
                    chart.resize();
                } catch (e) {
                    console.error("Error resizing chart:", e);
                }
            }
        });
    }, 250); // Adjust debounce delay as needed (e.g., 250ms)

    window.addEventListener('resize', debouncedResize);

     // --- Initial Check for Chart Rendering ---
     // Small delay to ensure DOM is fully ready for complex chart rendering
     setTimeout(() => {
         console.log("Checking chart rendering status...");
         Object.keys(charts).forEach(chartId => {
             const chart = charts[chartId];
             if (chart && chartDom) { // Check if chart instance exists
                 const chartDom = document.getElementById(chartId);
                 // A simple check: see if the container has a canvas or svg element added by ECharts
                 if (chartDom && (chartDom.querySelector('canvas') || chartDom.querySelector('svg'))) {
                     console.log(`Chart ${chartId} appears to be rendered.`);
                 } else if (chartDom){
                     console.warn(`Chart ${chartId} container is present, but no canvas/svg found. Rendering might have failed.`);
                      // Optionally try re-initializing or logging the option again
                      // console.warn(`Attempting to re-init ${chartId}`);
                      // initChart(chartId, chart.getOption()); // Be cautious with re-init loops
                 } else {
                      console.error(`Chart ${chartId} container is missing after initialization attempt.`);
                 }
             } else {
                 console.warn(`Chart instance for ${chartId} was not created successfully.`);
             }
         });
     }, 500); // Delay 500ms


}); // End of DOMContentLoaded