// 确保在 DOM 完全加载后执行脚本
document.addEventListener('DOMContentLoaded', function () {
    console.log('DeepForest KG 页面初始化 (独立文件版)');

    // --- DOM 元素引用 ---
    const graphChartDom = document.getElementById('knowledgeGraph'); // 图谱容器
    const nodeTypeDistChartDom = document.getElementById('nodeTypeDistChart'); // 节点类型图容器
    const edgeTypeDistChartDom = document.getElementById('edgeTypeDistChart'); // 关系类型图容器
    const nodeDegreeChartDom = document.getElementById('nodeDegreeChart');   // Top N 节点图容器
    const speciesStatusChartDom = document.getElementById('speciesStatusChart'); // 物种状态图容器
    const infoPanel = document.getElementById('infoPanelContent');           // 详细信息面板容器
    const searchInput = document.getElementById('searchInput');              // 搜索输入框
    const searchButton = document.getElementById('searchButton');            // 搜索按钮
    const totalNodesStat = document.getElementById('totalNodesStat');        // 总节点数显示
    const totalEdgesStat = document.getElementById('totalEdgesStat');        // 总关系数显示
    const loadingPlaceholder = document.getElementById('graphPlaceholder');    // 图谱加载提示

    // --- 基本检查 ---
    // 检查必要的 DOM 元素是否存在
    if (!graphChartDom || !nodeTypeDistChartDom || !edgeTypeDistChartDom || !nodeDegreeChartDom || !speciesStatusChartDom || !infoPanel) {
         console.error("[致命错误] 缺少一个或多个必需的 DOM 元素！请检查 HTML 中的 ID。");
         if (loadingPlaceholder) loadingPlaceholder.innerHTML = '<p style="color:red;text-align:center;">错误：页面结构不完整。</p>';
         return; // 阻止后续代码执行
     }
    // 检查 ECharts 库是否已加载
    if (typeof echarts === 'undefined') {
        console.error('[致命错误] ECharts 库未加载。');
        if (graphChartDom) graphChartDom.innerHTML = '<p style="color:red;text-align:center;">错误：ECharts 库未加载。</p>';
        return; // 阻止后续代码执行
    }
    console.log("[信息] DOM 和 ECharts 库已准备就绪。");

    // --- ECharts 实例 ---
    // 初始化时设为 null，在 loadAndRenderGraph 中实际创建
    let knowledgeGraphChart = null;
    // 初始化分析图表的实例
    let nodeTypeDistChart = echarts.init(nodeTypeDistChartDom);
    let edgeTypeDistChart = echarts.init(edgeTypeDistChartDom);
    let nodeDegreeChart = echarts.init(nodeDegreeChartDom);
    let speciesStatusChart = echarts.init(speciesStatusChartDom); // 初始化新图表实例
    // 用于存储当前图谱数据的变量
    let currentGraphData = { nodes: [], links: [], categories: [], speciesConfirmationStatus: [] };

    // --- 模拟图谱数据函数 ---
    function getMockGraphData() {
        // 定义节点类型及其颜色
        const categories = [
           { name: 'Species', itemStyle: { color: '#5dade2' } },   // 物种 - 蓝色
           { name: 'Reference', itemStyle: { color: '#48c9b0' } }, // 文献 - 绿色
           { name: 'Location', itemStyle: { color: '#f39c12' } },  // 位置 - 橙色
           { name: 'Taxonomy', itemStyle: { color: '#e74c3c' } },  // 分类 - 红色
           { name: 'Host', itemStyle: { color: '#a569bd' } },    // 寄主 - 紫色
           { name: 'File', itemStyle: { color: '#1abc9c' } },     // 文件 - 青色
           { name: 'Image', itemStyle: { color: '#3498db' } }    // 图片 - 另一种蓝色
       ];
       // 定义节点数据 (包含示例的 status)
       const nodes = [
           { id: 'sp1', name: '松材线虫\nB. xylophilus', value: 20, category: 0, details: { type: 'Species', guid: 'guid-sp1', scientificName: 'Bursaphelenchus xylophilus', chineseName: '松材线虫', classification: '线虫动物门', status: '已确认', desc: '一种毁灭性森林病害，主要危害松树...' } },
           { id: 'sp2', name: '美国白蛾\nH. cunea', value: 15, category: 0, details: { type: 'Species', guid: 'guid-sp2', scientificName: 'Hyphantria cunea', chineseName: '美国白蛾', classification: '昆虫纲', status: '已确认', desc: '一种杂食性害虫，危害多种阔叶树...' } },
           { id: 'sp3', name: '杨树\nPopulus', value: 10, category: 4, details: { type: 'Host/Species', guid: 'guid-sp3', scientificName: 'Populus', chineseName: '杨树', classification: '被子植物门', status: '已确认' } },
           { id: 'tx1', name: '线虫属\nBursaphelenchus', value: 5, category: 3, details: { type: 'Taxonomy', level: 'Genus', name: 'Bursaphelenchus'} },
           { id: 'loc1', name: '中国', value: 8, category: 2, details: { type: 'Location', level: 'Country', name: '中国'} },
           { id: 'loc2', name: '北美', value: 8, category: 2, details: { type: 'Location', level: 'Continent', name: '北美'} },
           { id: 'ref1', name: '松材线虫研究进展 (2023)', value: 12, category: 1, details: { type: 'Reference', guid: 'guid-ref1', title: '松材线虫研究进展', authors: '张三, 李四', year: 2023, doi: '10.xxxx/xxxx' } },
           { id: 'ref2', name: '美国白蛾防控手册', value: 10, category: 1, details: { type: 'Reference', guid: 'guid-ref2', title: '美国白蛾防控手册', authors: '王五', year: 2022 } },
           { id: 'file1', name: '进展.pdf', value: 3, category: 5, details: { type: 'File', guid: 'guid-file1', name: '进展.pdf', url: '/files/ref1.pdf', fileSize: '2.5 MB'} },
           { id: 'img1', name: '白蛾成虫图', value: 3, category: 6, details: { type: 'Image', guid: 'guid-img1', title: '美国白蛾成虫', imagePath: '/images/sp2_adult.jpg'} },
            { id: 'sp4', name: '待审核物种A', value: 8, category: 0, details: { type: 'Species', guid: 'guid-sp4', scientificName: 'Pending species A', chineseName: '待审核物种A', status: '待审核' } },
            { id: 'sp5', name: '有疑问物种B', value: 6, category: 0, details: { type: 'Species', guid: 'guid-sp5', scientificName: 'Questionable species B', chineseName: '有疑问物种B', status: '有疑问' } }
       ];
       // 定义关系数据
       const links = [
           { source: 'sp1', target: 'tx1', details: { type: 'IS_CLASSIFIED_AS'} },
           { source: 'sp1', target: 'loc1', details: { type: 'DISTRIBUTED_IN', status: 'present'} },
           { source: 'sp1', target: 'ref1', details: { type: 'MENTIONED_IN', refType: 'biology'} },
           { source: 'sp2', target: 'loc1', details: { type: 'DISTRIBUTED_IN', status: 'present'} },
           { source: 'sp2', target: 'loc2', details: { type: 'DISTRIBUTED_IN', status: 'present'} },
           { source: 'sp2', target: 'sp3', lineStyle: { color: '#f1948a', width: 1.5 }, details: { type: 'HOSTS_ON', interaction: 'primary', parts: '叶片'} },
           { source: 'sp2', target: 'ref2', details: { type: 'MENTIONED_IN', refType: 'control'} },
           { source: 'ref1', target: 'file1', details: { type: 'HAS_FILE'} },
           { source: 'sp2', target: 'img1', details: { type: 'HAS_IMAGE'} },
           { source: 'sp4', target: 'loc1', details: { type: 'DISTRIBUTED_IN'} },
           { source: 'sp5', target: 'sp3', details: { type: 'HOSTS_ON'} }
       ];

        // 计算物种确认状态分布
        const speciesStatusCounts = nodes.reduce((acc, node) => {
            if (node.category === 0 && node.details?.status) { // 假设 category 0 是物种
                const status = node.details.status;
                acc[status] = (acc[status] || 0) + 1;
            }
            return acc;
        }, {});
         const speciesConfirmationStatus = Object.entries(speciesStatusCounts)
            .map(([name, value]) => ({ name, value }));

        // 返回所有数据
        return { nodes, links, categories, speciesConfirmationStatus };
    }

    // --- ECharts 图谱选项函数 ---
    function getGraphOption(graphData) {
        if (loadingPlaceholder) loadingPlaceholder.style.display = 'none'; // 隐藏加载提示
        const showLabels = document.getElementById('showLabelsToggle')?.checked ?? true; // 获取标签显示状态

        return {
             tooltip: { // 鼠标悬停提示框
                 formatter: (params) => { // 自定义提示框内容
                     if (params.dataType === 'node') { // 节点提示
                         let detailsHtml = `<b>${params.data.name.replace('\n', ' ')}</b><br/>类型: ${params.data.details?.type || graphData.categories[params.data.category]?.name || '未知'}`;
                         // 添加部分详细信息到提示框
                         if(params.data.details) {
                             for(const key in params.data.details) {
                                 if (!['type', 'name', 'guid', 'desc', 'biological_properties', 'morphological_characteristics', 'management_info'].includes(key) && params.data.details[key]) {
                                      let value = params.data.details[key];
                                      if (typeof value === 'string' && value.length > 50) value = value.substring(0, 47) + '...'; // 截断长文本
                                     detailsHtml += `<br/>${key}: ${value}`;
                                 }
                             }
                         }
                         return detailsHtml;
                     } else if (params.dataType === 'edge') { // 关系提示
                        const type = params.data.details?.type || '未知关系';
                        const sourceNode = graphData.nodes.find(n => n.id === params.data.source);
                        const targetNode = graphData.nodes.find(n => n.id === params.data.target);
                        const sourceName = sourceNode ? sourceNode.name.split('\n')[0] : params.data.source;
                        const targetName = targetNode ? targetNode.name.split('\n')[0] : params.data.target;
                       return `关系: ${type}<br/>${sourceName} → ${targetName}`; // 使用箭头
                     } return '';
                 },
                 confine: true // 限制提示框在图表区域内
             },
             legend: [{ // 图例配置
                 data: graphData.categories.map(a => a.name), // 显示所有节点类型
                 orient: 'horizontal', // 水平排列
                 bottom: 10, // 底部距离
                 left: 'center', // 居中
                 itemWidth: 12, itemHeight: 12, // 图例标记大小
                 textStyle: { fontSize: 10, color: '#666' }, // 图例文字样式
                 backgroundColor: 'rgba(255, 255, 255, 0.8)', // 半透明背景
                 padding: 5,
                 borderRadius: 4
             }],
             series: [{ // 图谱系列配置
                 type: 'graph', // 类型为关系图
                 layout: 'force', // 默认使用力引导布局
                 categories: graphData.categories, // 节点分类
                 data: graphData.nodes.map(node => ({ // 节点数据处理
                     ...node, // 展开节点原有属性
                     symbolSize: node.value * 1.2 + 15, // 根据 value 调整节点大小
                     label: { // 节点标签
                         show: showLabels, // 是否显示由开关控制
                         position: 'right', // 标签位置
                         formatter: '{b}', // 显示节点名称 (name 属性)
                         fontSize: 9, // 字体大小
                         color: '#333',
                         overflow: 'truncate', // 超长时截断
                         width: 80 // 截断宽度
                     },
                      itemStyle: { // 节点样式
                         shadowBlur: 5, // 阴影模糊
                         shadowColor: 'rgba(0, 0, 0, 0.15)' // 阴影颜色
                     },
                 })),
                 links: graphData.links.map(link => ({ // 关系数据处理
                     ...link, // 展开关系原有属性
                     label: { show: false }, // 默认不显示关系标签
                     lineStyle: { // 关系线样式
                         opacity: 0.6, // 透明度
                         width: link.lineStyle?.width || 1, // 线宽 (如果数据中定义了则使用，否则为 1)
                         color: link.lineStyle?.color || '#adb5bd', // 线颜色 (如果数据中定义了则使用，否则为浅灰色)
                         curveness: 0.1 // 曲线弯曲度
                     },
                 })),
                 roam: true, // 开启缩放和平移
                 label: { show: showLabels, position: 'right', formatter: '{b}', fontSize: 9 }, // 全局标签设置也受开关控制
                 force: { // 力引导布局参数
                     repulsion: 90, // 节点间斥力因子
                     gravity: 0.04, // 节点受到的向中心力
                     edgeLength: [70, 130], // 边的理想长度范围
                     layoutAnimation: true // 开启动画效果
                 },
                 lineStyle: { opacity: 0.6, width: 1, curveness: 0.1 }, // 全局默认线样式
                 emphasis: { // 鼠标悬停/聚焦时的样式
                     focus: 'adjacency', // 高亮聚焦的节点及其邻接节点和边
                     label: { show: true, fontSize: 11, fontWeight: 'bold' }, // 高亮时标签样式
                     lineStyle: { width: 2, opacity: 1 }, // 高亮时关系线样式
                     itemStyle: { // 高亮时节点样式
                         borderColor: 'rgba(255,255,255,0.8)', // 白色边框
                         borderWidth: 2,
                         shadowBlur: 10,
                         shadowColor: 'rgba(0, 0, 0, 0.2)'
                     }
                 }
             }]
         };
     }

    // --- 分析图表选项函数 ---
    function getNodeTypeOption(graphData) {
        const typeCounts = graphData.nodes.reduce((acc, node) => { const categoryName = graphData.categories[node.category]?.name || '未知'; acc[categoryName] = (acc[categoryName] || 0) + 1; return acc; }, {});
        const data = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
        return { tooltip: { trigger: 'item', formatter: '{b} : {c} ({d}%)' }, legend: { show: false }, series: [{ name: '节点类型', type: 'pie', radius: ['50%', '75%'], avoidLabelOverlap: true, itemStyle: { borderRadius: 5, borderColor: '#fff', borderWidth: 1 }, label: { show: true, fontSize: 10, formatter:'{b}\n{d}%' }, labelLine: { show: true, length: 4, length2: 4 }, data: data, color: graphData.categories.map(c => c.itemStyle?.color || '#ccc') }] };
    }
    function getEdgeTypeOption(graphData) {
        const typeCounts = graphData.links.reduce((acc, link) => { const typeName = link.details?.type || '未知关系'; acc[typeName] = (acc[typeName] || 0) + 1; return acc; }, {});
        const data = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
        return { tooltip: { trigger: 'item', formatter: '{b} : {c} ({d}%)' }, legend: { show: false }, series: [{ name: '关系类型', type: 'pie', radius: '75%', data: data, label: { show: true, fontSize: 10, formatter:'{b}\n{d}%' }, labelLine: { show: true, length: 4, length2: 4 }, itemStyle: { borderRadius: 5 }, color: ['#FC8452', '#a569bd', '#4dd0e1', '#5dade2', '#48c9b0', '#f39c12', '#e74c3c'].reverse() }] };
    }
    function getNodeDegreeOption(graphData) {
        const degree = {}; graphData.links.forEach(link => { degree[link.source] = (degree[link.source] || 0) + 1; degree[link.target] = (degree[link.target] || 0) + 1; });
        const sortedDegrees = Object.entries(degree).map(([id, count]) => { const node = graphData.nodes.find(n => n.id === id); return { name: node ? node.name.replace('\n', ' ') : id, value: count }; }).sort((a, b) => b.value - a.value).slice(0, 5);
        return { tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } }, grid: { left: '3%', right: '10%', bottom: '3%', containLabel: true }, xAxis: { type: 'value', boundaryGap: [0, 0.01], axisLabel: { fontSize: 10 } }, yAxis: { type: 'category', data: sortedDegrees.map(d => d.name).reverse(), axisLabel: { fontSize: 9, interval: 0 } }, series: [{ name: '连接数', type: 'bar', data: sortedDegrees.map(d => d.value).reverse(), itemStyle: { color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{ offset: 0, color: '#f8c076' }, { offset: 1, color: '#f39c12' }]), borderRadius: [0, 3, 3, 0] }, label: { show: true, position: 'right', color: '#333', fontSize: 9 } }] };
    }
    // 物种状态图表选项
    function getSpeciesStatusDistOption(statusData) {
         return {
             tooltip: { trigger: 'item', formatter: '{b} : {c} ({d}%)' },
             legend: { show: false }, // 不显示图例
             series: [{
                 name: '确认状态', type: 'pie', radius: ['45%', '70%'], // 环状图
                 avoidLabelOverlap: true, itemStyle: { borderRadius: 5, borderColor: '#fff', borderWidth: 1 },
                 label: { show: true, fontSize: 9, formatter:'{b}\n{d}%' }, // 显示标签和百分比
                 labelLine: { show: true, length: 3, length2: 5 }, // 标签线
                 data: statusData,
                 color: ['#48c9b0', '#f39c12', '#e74c3c', '#8e44ad'] // 状态颜色：绿(已确认)、黄(待审核)、红(有疑问)、紫(其他)
             }]
         };
     }


    // --- 更新信息面板函数 (更新 DOM) ---
    function updateInfoPanel(params) {
        // 清空之前的内容
        infoPanel.innerHTML = '';
        // 检查是否有有效数据
        if (!params || !params.data) {
            infoPanel.innerHTML = '<p>请在图谱中点击一个节点或关系以查看详细信息。</p>';
            return;
        }

        const isNode = params.dataType === 'node'; // 判断是节点还是边
        const data = params.data;                   // 获取数据
        const details = data.details;               // 获取详细信息对象
        const dataType = isNode ? '节点' : '关系';    // 确定类型名称

        // 获取节点或关系的名称用于标题
        let name = '';
         if (isNode) {
             name = data.name ? data.name.replace('\n',' ') : data.id; // 优先用 name，否则用 id
         } else { // 如果是边，构造 "源节点 -> 目标节点" 的名称
             const sourceNode = currentGraphData.nodes.find(n => n.id === data.source);
             const targetNode = currentGraphData.nodes.find(n => n.id === data.target);
             const sourceName = sourceNode ? sourceNode.name.split('\n')[0] : data.source; // 取节点名称的第一行
             const targetName = targetNode ? targetNode.name.split('\n')[0] : data.target;
             name = `${sourceName} → ${targetName}`; // 使用箭头连接
         }

        // 创建并添加标题
        const titleElement = document.createElement('h4');
        titleElement.textContent = `${dataType}信息: ${name}`;
        infoPanel.appendChild(titleElement);

        // 如果没有详细信息，显示提示
         if (!details) {
             const p = document.createElement('p');
             p.textContent = '无详细信息。';
             infoPanel.appendChild(p);
             return;
         }

        // 创建无序列表来显示详细信息
        const ul = document.createElement('ul');
        // 遍历 details 对象的属性
        for (const key in details) {
             if (key === 'type') continue; // 不重复显示类型

            const li = document.createElement('li');        // 创建列表项
            const propSpan = document.createElement('span'); // 创建属性名 span
            propSpan.className = 'property';                // 设置 CSS 类
            propSpan.textContent = `${key}:`;               // 设置属性名文本

            const valueSpan = document.createElement('span'); // 创建属性值 span
            valueSpan.className = 'value';                 // 设置 CSS 类

            let value = details[key];                       // 获取属性值
            // 对特定属性（如 URL、图片路径、DOI）进行特殊格式化，添加链接和图标
            if ((key === 'url' || key === 'imagePath') && value) {
                const a = document.createElement('a');
                a.href = value;
                a.target = '_blank'; // 在新标签页打开
                a.title = '打开链接';
                // 截断过长的 URL 并添加外部链接图标
                a.innerHTML = `${value.length > 40 ? value.substring(0, 37) + '...' : value} <i class='fas fa-external-link-alt fa-xs'></i>`;
                valueSpan.appendChild(a);
            } else if (key === 'doi' && value) {
                 const a = document.createElement('a');
                 a.href = `https://doi.org/${value}`;
                 a.target = '_blank';
                 a.title = '打开DOI链接';
                 a.innerHTML = `${value} <i class='fas fa-external-link-alt fa-xs'></i>`;
                 valueSpan.appendChild(a);
             } else if (typeof value === 'string' && value.length > 150) { // 截断过长的字符串
                 valueSpan.textContent = `${value.substring(0, 147)}...`;
                 valueSpan.title = value; // 鼠标悬停时显示完整内容
             }
             else { // 普通文本直接显示
                valueSpan.textContent = value;
             }

            // 将属性名和属性值添加到列表项
            li.appendChild(propSpan);
            li.appendChild(document.createTextNode(' ')); // 添加空格
            li.appendChild(valueSpan);
            ul.appendChild(li); // 将列表项添加到列表中
        }
        infoPanel.appendChild(ul); // 将列表添加到信息面板
    }

    // --- 加载并渲染所有图表函数 ---
    function loadAndRenderGraph() {
        if (loadingPlaceholder) loadingPlaceholder.style.display = 'block'; // 显示加载提示
        console.log("[信息] 开始加载和渲染图谱...");

        try {
            console.log("[调试] 获取模拟数据...");
            currentGraphData = getMockGraphData(); // 获取数据
            // 检查获取的数据是否有效
            if (!currentGraphData || !currentGraphData.nodes || !currentGraphData.links || !currentGraphData.categories || !currentGraphData.speciesConfirmationStatus) {
                 throw new Error("获取的图谱数据无效或不完整。");
             }
            console.log(`[调试] 数据加载完成: ${currentGraphData.nodes.length} 个节点, ${currentGraphData.links.length} 条关系.`);

            // 初始化主图谱 ECharts 实例 (如果尚未初始化)
            if (!knowledgeGraphChart && graphChartDom) {
                 console.log("[调试] 初始化主图谱 ECharts 实例...");
                 knowledgeGraphChart = echarts.init(graphChartDom);
                 console.log("[调试] 主图谱 ECharts 实例已创建。");
             } else if (!graphChartDom) {
                 throw new Error("图谱容器丢失！无法渲染。");
             } else { // 如果已存在实例，先清空
                 console.log("[调试] 复用已存在的主图谱 ECharts 实例，正在清空...");
                 knowledgeGraphChart.clear();
             }

            // 更新统计数据
            totalNodesStat.textContent = currentGraphData.nodes.length;
            totalEdgesStat.textContent = currentGraphData.links.length;

            // 渲染主图谱
            console.log("[调试] 准备主图谱选项...");
            const graphOption = getGraphOption(currentGraphData);
            console.log("[调试] 设置主图谱选项...");
            knowledgeGraphChart.setOption(graphOption, true); // true 表示不合并选项，完全替换
            console.log("[成功] 主图谱渲染完成。");

            // 渲染分析图表
            console.log("[调试] 渲染分析图表...");
            nodeTypeDistChart.setOption(getNodeTypeOption(currentGraphData), true);
            edgeTypeDistChart.setOption(getEdgeTypeOption(currentGraphData), true);
            nodeDegreeChart.setOption(getNodeDegreeOption(currentGraphData), true);
            speciesStatusChart.setOption(getSpeciesStatusDistOption(currentGraphData.speciesConfirmationStatus), true); // 渲染新增的状态图表
            console.log("[成功] 分析图表渲染完成。");

            // 绑定图谱点击事件 (先移除旧监听器，再添加新的)
            knowledgeGraphChart.off('click');
            knowledgeGraphChart.on('click', updateInfoPanel); // 点击时调用更新信息面板函数
            console.log("[信息] 图谱点击事件监听器已附加。");

         } catch (error) { // 捕获渲染过程中的错误
             console.error("[错误] 加载/渲染图谱时失败:", error);
             if (loadingPlaceholder) { // 在加载提示区显示错误信息
                loadingPlaceholder.innerHTML = `<p style="color:red;text-align:center;">加载图谱时出错: ${error.message}<br/>请检查控制台。</p>`;
                loadingPlaceholder.style.display = 'block';
             }
             // 出错时清空分析图表
             nodeTypeDistChart.clear(); edgeTypeDistChart.clear(); nodeDegreeChart.clear(); speciesStatusChart.clear();
         } finally {
             console.log("[信息] 图谱加载和渲染流程结束。");
         }
     }

    // --- 事件监听器 ---
    // 搜索按钮点击事件
    searchButton.addEventListener('click', () => {
        const searchTerm = searchInput.value.toLowerCase().trim(); // 获取并处理搜索词
        console.log("[事件] 搜索按钮点击。搜索词:", searchTerm);
        if (!searchTerm) { // 如果搜索词为空，重新加载完整图谱
            loadAndRenderGraph(); return;
        }
        // 简单的模拟搜索：过滤当前数据 (实际应调用后端 API)
        // 找到名称或详情中包含搜索词的节点
        const filteredNodes = currentGraphData.nodes.filter(node =>
            node.name.toLowerCase().includes(searchTerm) ||
            (node.details && Object.values(node.details).some(val => String(val).toLowerCase().includes(searchTerm)))
        );
        const filteredNodeIds = new Set(filteredNodes.map(n => n.id)); // 获取匹配节点的 ID 集合

        // (可选) 包含找到节点的一级邻居以提供上下文
        const neighbors = new Set();
        currentGraphData.links.forEach(link => {
            if (filteredNodeIds.has(link.source)) neighbors.add(link.target);
            if (filteredNodeIds.has(link.target)) neighbors.add(link.source);
        });
        neighbors.forEach(id => filteredNodeIds.add(id)); // 将邻居节点 ID 加入集合

        // 根据最终的节点 ID 集合过滤节点和边
        const finalFilteredNodes = currentGraphData.nodes.filter(node => filteredNodeIds.has(node.id));
        const finalFilteredLinks = currentGraphData.links.filter(link =>
            filteredNodeIds.has(link.source) && filteredNodeIds.has(link.target)
        );
        console.log(`[调试] 搜索过滤结果: ${finalFilteredNodes.length} 个节点, ${finalFilteredLinks.length} 条关系.`);
        // 使用过滤后的数据更新图谱
        if (knowledgeGraphChart) {
            knowledgeGraphChart.setOption(getGraphOption({
                nodes: finalFilteredNodes,
                links: finalFilteredLinks,
                categories: currentGraphData.categories // 保持原始分类信息
            }), true);
        } else { console.error("无法应用搜索过滤器，图谱图表未初始化。"); }
    });
    // 搜索输入框回车事件
    searchInput.addEventListener('keyup', (event) => { if (event.key === 'Enter') { searchButton.click(); } });

    // 布局切换按钮事件
    document.getElementById('layoutForce').addEventListener('click', function() {
        knowledgeGraphChart?.setOption({ series: [{ layout: 'force' }] }); // 切换为力导引布局
        this.classList.add('active'); // 设置按钮激活样式
        document.getElementById('layoutCircular').classList.remove('active'); // 移除另一个按钮的激活样式
    });
    document.getElementById('layoutCircular').addEventListener('click', function() {
        knowledgeGraphChart?.setOption({ series: [{ layout: 'circular', circular: { rotateLabel: true } }] }); // 切换为环形布局
        this.classList.add('active');
        document.getElementById('layoutForce').classList.remove('active');
    });
    // 标签显示切换事件
    document.getElementById('showLabelsToggle').addEventListener('change', function() {
        knowledgeGraphChart?.setOption({ series: [{ label: { show: this.checked } }] }); // 根据开关状态设置标签显示
    });

    // --- 时钟与窗口大小调整 ---
    // 更新时钟函数
    function updateTime() {
        const now = new Date();
        const h=String(now.getHours()).padStart(2,'0');
        const m=String(now.getMinutes()).padStart(2,'0');
        const s=String(now.getSeconds()).padStart(2,'0');
        const timeEl = document.getElementById('currentTime');
        if (timeEl) timeEl.textContent = `${h}:${m}:${s}`;
    }
    setInterval(updateTime, 1000); // 每秒更新一次
    updateTime(); // 立即执行一次

    // 防抖函数，用于优化 resize 事件处理
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
    // 窗口大小调整事件处理器 (使用防抖)
    const debouncedResize = debounce(() => {
        console.log('[事件] 调整图表大小...');
        // 调整所有 ECharts 实例的大小
        knowledgeGraphChart?.resize();
        nodeTypeDistChart?.resize();
        edgeTypeDistChart?.resize();
        nodeDegreeChart?.resize();
        speciesStatusChart?.resize(); // 调整新图表的大小
    }, 250); // 延迟 250 毫秒执行 resize
    window.addEventListener('resize', debouncedResize); // 监听窗口大小变化

    // --- 初始加载 ---
    loadAndRenderGraph(); // 页面加载完成后，加载并渲染图谱

}); // 结束 DOMContentLoaded 事件监听