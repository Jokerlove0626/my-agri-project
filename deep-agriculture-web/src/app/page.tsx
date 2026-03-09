  // src/app/page.tsx
  import { redirect } from 'next/navigation'; // 1. 从 next/navigation 导入 redirect 函数

  /**
   * 根路由页面组件
   * 当用户访问网站根目录 (/) 时，此组件会被调用。
   * 我们在这里直接执行重定向到 /chat 页面。
   */
  export default function Home() {
    redirect('/index.html'); // 2. 调用 redirect 函数进行重定向
  }