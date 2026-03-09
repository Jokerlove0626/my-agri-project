// src/services/analysisApi.ts
import axiosInstance from '@/lib/axiosInstance'; // ** 1. 导入共享实例 **
import type { DashboardData } from '@/analysis/types';

/**
 * 调用后端 API 获取数据分析仪表盘数据
 * @returns Promise<DashboardData> 返回包含仪表盘数据的 Promise 对象
 */
export const fetchDashboardData = async (): Promise<DashboardData> => {
    try {
        // ** 2. 使用共享实例，传递相对路径 **
        // 响应拦截器会自动处理 BaseResponse 并返回 data 字段
        const dashboardData = await axiosInstance.get<DashboardData>('/analysis/dashboard');
        console.log('成功从后端获取仪表盘数据');
        return dashboardData.data;
    } catch (error: any) {
        // ** 3. 错误处理：拦截器已处理大部分情况，这里只记录和抛出最终错误 **
        console.error('获取仪表盘数据时发生错误:', error);
        // 抛出从拦截器传递过来的错误或新的错误信息
        throw new Error(`获取仪表盘数据失败: ${error.message || '未知错误'}`);
    }
};

// 其他与 analysis API 相关的函数也应使用 axiosInstance