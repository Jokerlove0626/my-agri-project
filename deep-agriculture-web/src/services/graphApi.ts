// src/services/graphApi.ts
import axiosInstance from '@/lib/axiosInstance'; // ** 1. 导入共享实例 **
import type { GraphData } from '@/graph/types';

/**
 * 调用后端 API 获取知识图谱数据
 * @returns Promise<GraphData> 返回包含图谱数据的 Promise 对象
 */
export const fetchGraphData = async (): Promise<GraphData> => {
    try {
        // ** 2. 使用共享实例，传递相对路径 **
        const graphData = await axiosInstance.get<GraphData>('/graph/data');
        console.log('成功从后端获取图谱数据');
        return graphData.data;
    } catch (error: any) {
        // ** 3. 错误处理 **
        console.error('获取图谱数据时发生错误:', error);
        throw new Error(`获取图谱数据失败: ${error.message || '未知错误'}`);
    }
};

// 其他图谱 API 函数 (如果需要)
// export const fetchNeighbors = async (nodeId: string): Promise<GraphData> => { ... }