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

        // 💡 关键改动：使用 as any 或者 as unknown as ... 告诉 TS 拦截器已经处理过了
        const response = await axiosInstance.get<any>('/search', { params: searchParams });
        const data = response as unknown as PageVO<SearchResultItemVO>;
        
        // 现在 TS 就不会报错了，因为它知道 data 里确实有 total
        console.log(`搜索成功: 共 ${data.total} 条结果`);
        
        return data;
    } catch (error: any) {
        console.error('搜索请求失败:', error);
        throw new Error(`搜索失败: ${error.message || '未知错误'}`);
    }
};

/**
 * 调用后端 API 获取物种详细信息
 * @param speciesId 物种 ID
 * @returns Promise<SpeciesDetailData>
 */
// src/services/searchApi.ts

export const fetchSpeciesDetail = async (id: string) => {
  // 必须使用绝对路径，指向你的 Python 后端
  const BACKEND_URL = "http://localhost:8000"; 
  
  // 注意：确保这里的路径与后端 main.py 中的 @app.get 路径一致
  // 如果后端是 @app.get("/api/species/{id}")，那就不要加中间的 /search
  const url = `${BACKEND_URL}/api/search/species/${id}`;
  
  console.log("🚀 正在请求后端详情接口:", url);

  const response = await fetch(url, {
    cache: 'no-store' // 保证实时性
  });

  if (!response.ok) {
    throw new Error(`后端返回错误: ${response.status}`);
  }
  return response.json();
};