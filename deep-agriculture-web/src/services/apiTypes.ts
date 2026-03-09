// src/services/apiTypes.ts

/**
 * 单条搜索结果项视图对象的类型定义
 * 与后端 com.weilanx.deepforest.search.dto.SearchResultItemVO 对应
 */
export interface SearchResultItemVO {
    id: string;             // 唯一ID
    type: 'species' | 'document'; // 类型: "species" 或 "document"
    icon?: string;          // 建议的图标标识符 (可选)
    title: string;          // 标题 (物种中文名或文献标题)
    scientificName?: string;// 学名 (物种特有)
    classification?: string;// 分类 (物种特有)
    status?: string;        // 状态文字 (物种特有)
    statusType?: string;    // 状态类型用于样式 (物种特有: confirmed, pending, default)
    author?: string;        // 作者 (文献特有)
    description: string;    // 描述摘要
    tags: string[];         // 标签列表
    detailLink: string;     // 指向详情页的相对路径 (前端使用)
}

/**
 * 通用分页响应视图对象的类型定义
 * 与后端 com.weilanx.deepforest.search.dto.PageVO 对应
 * @template T 记录的类型
 */
export interface PageVO<T> {
    records: T[];       // 当前页的记录列表
    total: number;        // 符合条件的总记录数 (使用 number)
    page: number;         // 当前页码 (使用 number)
    pageSize: number;     // 每页大小 (使用 number)
    totalPages: number;   // 总页数 (使用 number)
}

// 你可以在此文件中添加更多与 API 相关的共享类型定义