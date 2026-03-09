// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true, // 建议保持开启严格模式

  // 1. 【新增】开启 Standalone 模式
  // 这会让 Next.js 打包时生成一个极小的独立运行文件夹，非常适合 Docker 或 PM2 部署
  output: 'standalone',

  // 2. 【新增】API 代理转发 (解决 404 和跨域的核心)
  // 告诉 Next.js：凡是 /api 开头的请求，都帮我偷偷转发给 Python 后端 (8000端口)
  async rewrites() {
    return [
      {
        source: '/api/:path*',           // 前端发出的请求，例如 /api/chat
        destination: 'http://127.0.0.1:8000/api/:path*', // 转发的目标，例如 http://localhost:8000/api/chat
      },
    ];
  },

  // ESLint 配置 (保持不变)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // 实验性功能配置 (保持不变)
  experimental: {
    // Add experimental features here if needed
  },

  // --- 图像优化配置 (完全保持你原来的设置) ---
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      // 如果你的应用还需要从其他外部域加载图片，可以在这里继续添加对象
    ],
  },
};

export default nextConfig;