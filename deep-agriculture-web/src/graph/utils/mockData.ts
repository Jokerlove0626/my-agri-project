// src/graph/utils/mockData.ts
import { GraphData } from '../types'; // 引入类型定义

/**
 * 生成模拟知识图谱数据
 * @returns {GraphData} 包含节点、关系、分类和物种状态的图谱数据
 */
export function getMockGraphData(): GraphData {
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
    }, {} as Record<string, number>);

    const speciesConfirmationStatus = Object.entries(speciesStatusCounts)
        .map(([name, value]) => ({ name, value }));

    // 返回所有数据
    return { nodes, links, categories, speciesConfirmationStatus };
}