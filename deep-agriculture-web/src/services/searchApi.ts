// src/services/searchApi.ts
import axiosInstance, { API_BASE_URL } from '@/lib/axiosInstance'; // ** 1. 导入共享实例和 BASE_URL 字符串 **
import type { SpeciesDetailData } from '@/search/detail/types';
import type { SearchResultItemVO, PageVO } from './apiTypes';

// 搜索请求参数接口
export interface SearchParams {
    query?: string;
    page?: number;
    pageSize?: number;
    type?: 'species' | 'document';
    classification?: string;
    status?: string;
    taxonomicLevel?: string;
    continent?: string;
    country?: string;
    province?: string;
    hostName?: string;
    hostType?: string;
    refType?: string;
    pubYear?: number;
}

/**
 * 调用后端 API 执行搜索
 * @param params 搜索参数
 * @returns Promise<PageVO<SearchResultItemVO>>
 */
export const fetchSearchResults = async (params: SearchParams): Promise<PageVO<SearchResultItemVO>> => {
    try {
        console.log('发起搜索请求, Params:', params);
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                searchParams.append(key, String(value));
            }
        });

        // ** 2. 使用共享实例，传递相对路径和参数 **
        // 基础 URL 是 /api, 这里路径是 /search
        const responseData = await axiosInstance.get<PageVO<SearchResultItemVO>>('/search', { params: searchParams });
        console.log(`搜索成功: 共 ${responseData.data.total} 条结果, 当前页 ${responseData.data.page}/${responseData.data.totalPages}`);
        return responseData.data;
    } catch (error: any) {
        // ** 3. 错误处理 **
        console.error('搜索请求失败:', error);
        throw new Error(`搜索失败: ${error.message || '未知错误'}`);
    }
};

/**
 * 调用后端 API 获取物种详细信息
 * @param speciesId 物种 ID
 * @returns Promise<SpeciesDetailData>
 */
export const fetchSpeciesDetail = async (speciesId: string): Promise<SpeciesDetailData> => {
    if (!speciesId) { throw new Error("物种 ID 不能为空"); }
    try {
        console.log(`请求物种详情, ID: ${speciesId}`);
        // ** 2. 使用共享实例，传递相对路径 **
        // 基础 URL 是 /api, 这里路径是 /search/species/{id}
        const detailData = await axiosInstance.get<SpeciesDetailData>(`/search/species/${speciesId}`);
        console.log(`成功获取物种 ${speciesId} 的详情`);
        return detailData.data;
    } catch (error: any) {
        // ** 3. 错误处理 (拦截器会处理大部分，这里捕获最终的) **
        console.error(`获取物种详情 ${speciesId} 失败:`, error);
        // 重新抛出更具体的错误信息
        if (error.message?.includes("未找到")) { // 检查拦截器或 Axios 返回的 404 信息
            throw new Error(`未找到指定ID的物种信息 (ID: ${speciesId})`);
        }
        throw new Error(`获取物种详情失败: ${error.message || '未知错误'}`);
    }
};