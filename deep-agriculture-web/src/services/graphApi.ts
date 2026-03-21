// src/services/graphApi.ts
import axiosInstance from '@/lib/axiosInstance'; // ** 1. 导入共享实例 **
import type { GraphData } from '@/graph/types';

/**
 * 调用后端 API 获取知识图谱数据
 * @returns Promise<GraphData> 返回包含图谱数据的 Promise 对象
 */
export const fetchGraphData = async (query: string = ''): Promise<GraphData> => {
    try {
        // 1. 拿到后端发来的朴实无华的数据
        const url = query 
            ? `/graph/all?query=${encodeURIComponent(query)}` 
            : '/graph/all';

        const response: any = await axiosInstance.get(url);
        const rawData = response.nodes ? response : (response.data?.nodes ? response.data : response.data?.data);

        // 2. 提取出所有的类型（比如：昆虫、病害、作物），给 ECharts 做图例和上色用
        const categoryNames = Array.from(new Set(rawData.nodes.map((n: any) => n.label || '未知分类')));
        const categories = categoryNames.map(name => ({ name: name as string }));

        // 3. 把节点包装成 ECharts 喜欢的高级格式
        const formattedNodes = rawData.nodes.map((n: any) => ({
            id: String(n.id), // 强制转字符串，防崩溃
            name: n.name,
            category: categoryNames.indexOf(n.label || '未知分类'), // ECharts 需要用索引号来对应颜色
            symbolSize: 60, // 把圆圈画大一点，好看！
            details: n // 把后端的原始数据塞进去，方便右侧信息栏读取
        }));

        // 4. 把关系线条也包装一下
        const formattedLinks = rawData.links.map((l: any) => ({
            source: String(l.source),
            target: String(l.target),
            name: l.type, 
            value: l.type, // 有的图表库读 name，有的读 value，咱们都给它塞上
        }));

        // 5. 拼装成终极企业级数据结构交差！
        return {
            nodes: formattedNodes,
            links: formattedLinks,
            categories: categories,
            speciesConfirmationStatus: [] // 塞个空数组，防止别的统计组件报错
        };

    } catch (error: any) {
        console.error('获取图谱数据时发生错误:', error);
        throw new Error(`获取图谱数据失败: ${error.message || '未知错误'}`);
    }
};
// 其他图谱 API 函数 (如果需要)
// export const fetchNeighbors = async (nodeId: string): Promise<GraphData> => { ... }