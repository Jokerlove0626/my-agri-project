// tailwind.config.js (示例)
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
      // ... 其他包含 Tailwind 类名的路径 ...
    ],
    darkMode: 'class', // 启用 class 策略的暗色模式
    theme: {
      extend: {
        colors: {
          'primary-green': { // 定义主绿色调的不同深浅
            light: '#6ee7b7', // 较亮
            DEFAULT: '#10b981', // 默认 (对应 --primary-color)
            dark: '#047857', // 较深
          },
          'secondary-green': { // 定义次要绿色调
            DEFAULT: '#065f46', // (对应 --secondary-color)
          },
          'tech-blue': { // 定义科技蓝色
            light: '#60a5fa',
            DEFAULT: '#2563eb', // (对应 --tech-blue)
            dark: '#1e40af',
          },
          'accent-yellow': { // 定义点缀黄色
            DEFAULT: '#f59e0b', // (对应 --accent-color)
          },
          // 定义中性色 (可以覆盖 Tailwind 默认的 gray)
          neutral: {
            '50': '#f8faff', // (对应 --background-color)
            '100': '#f3f6fb',
            '200': '#e6f0fa', // (对应 --border-color-light)
            '300': '#d1dce9',
            '400': '#9fb3c8',
            '500': '#7f8c9a', // (对应 --text-secondary)
            '600': '#627282',
            '700': '#4a5a6a', // 接近 --text-color
            '800': '#374553', // 暗模式背景
            '900': '#202d3a', // 更深的暗模式背景
          },
        },
        fontFamily: {
          // 定义字体族 (如果需要覆盖默认)
          sans: ['Noto Sans SC', 'Tahoma', 'Arial', 'sans-serif'],
          serif: ['Noto Serif SC', 'serif'],
        },
        boxShadow: { // 自定义阴影 (如果需要)
           soft: '0 6px 15px rgba(0, 0, 0, 0.05)',
           hover: '0 10px 20px rgba(0, 0, 0, 0.08)',
        },
        borderRadius: { // 自定义圆角 (如果需要)
           DEFAULT: '12px',
           sm: '8px',
           lg: '16px',
           full: '9999px',
        },
        // 可以扩展其他主题属性，如间距、字体大小等
      },
    },
    plugins: [],
  };