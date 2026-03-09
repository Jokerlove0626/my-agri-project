// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google"; // 或其他你选择的字体
import Header from "@/components/layout/Header"; // 引入新的或修改后的 Header
import "./globals.css"; // 引入全局样式

// 配置 Font Awesome 图标库 (如果 Header 中仍需使用)
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DeepAgriculture 智能系统", // 可以更新标题
  description: "农业病虫害智能问答与知识检索系统",
};

// 假设 Header 的高度在 CSS 中定义为 64px (或使用 CSS 变量 --header-height)
const HEADER_HEIGHT = '64px'; // 定义 Header 高度变量，需要与 CSS 中的值一致

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // **修复：确保 <html> 和 <body> 标签紧密相连，没有空格或换行**
    <html lang="en">{/* 设置语言为中文 */}
      <body className={inter.className}>
         {/* 渲染全局 Header */}
         <Header />
         {/* 主要页面内容区域 */}
         {/* 添加一个 key 到 main 元素可能有助于 React 更可靠地处理 hydration，
             尤其是在布局可能因路由变化而改变时。但通常不是必需的。
             可以尝试添加 key={Math.random()} 或基于路由的 key */}
         <main style={{ paddingTop: HEADER_HEIGHT }}> {/* 添加内边距，防止内容被 Header 遮挡 */}
           {children}
         </main>
         {/* 可能还有全局 Footer 等 */}
      </body>
    </html>
  );
}