// src/app/graph/page.tsx
import React from 'react';
import KnowledgeGraphPage from '@/graph/KnowledgeGraphPage'; // 引入主页面组件
import type { Metadata } from 'next'; // 导入 Metadata 类型

// 定义页面元数据 (可选，用于 SEO 和浏览器标签)
export const metadata: Metadata = {
    title: 'DeepForest - 知识图谱探索',
    description: 'DeepForest 林业知识图谱可视化与分析平台',
};

// 页面路由组件
export default function GraphPage() {
    return <KnowledgeGraphPage />; // 直接渲染页面主组件
}