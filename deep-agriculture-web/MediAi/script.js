// --- 严格模式 ---
'use strict';

// --- 全局变量与常量 ---
// 获取主题切换按钮及其图标元素
const themeToggleBtn = document.getElementById('theme-toggle');
const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');
// 获取 HTML 根元素
const htmlElement = document.documentElement;

// --- DOMContentLoaded Wrapper ---
// 确保在 DOM 完全加载并解析后执行脚本
document.addEventListener('DOMContentLoaded', () => {

    console.log("DOM fully loaded and parsed"); // 控制台输出，确认 DOM 加载完成

    initializeDarkMode(); // 初始化深浅模式
    initializeAOS();      // 初始化 AOS 滚动动画 (用于非 Hero 区域)
    initializeSmoothScroll(); // 初始化平滑滚动
    initializeGsapAnimations(); // 初始化 GSAP 动画 (包括 Hero 区域)

}); // End DOMContentLoaded

// --- 暗色模式逻辑 ---
function initializeDarkMode() {
    // 判断初始颜色模式：优先 localStorage，其次系统设置，默认浅色
    let isDarkMode = localStorage.getItem('color-theme') === 'dark' ||
        (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // 应用初始主题
    applyTheme(isDarkMode);

    // 为主题切换按钮添加点击事件监听器
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            // 获取当前是否为暗色模式
            isDarkMode = htmlElement.classList.contains('dark');
            // 切换主题
            applyTheme(!isDarkMode);
            console.log(`Theme toggled to: ${!isDarkMode ? 'dark' : 'light'}`); // 控制台输出切换状态
        });
    } else {
        console.error("Theme toggle button not found!"); // 错误处理：未找到按钮
    }

    // 监听系统颜色模式变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        // 仅当用户未手动设置主题时，才跟随系统变化
        if (!('color-theme' in localStorage)) {
            applyTheme(event.matches);
            console.log(`System theme changed. Applied: ${event.matches ? 'dark' : 'light'}`); // 控制台输出系统主题变化
        }
    });
}

// --- 应用主题的函数 ---
function applyTheme(isDark) {
    // 切换按钮图标的显示/隐藏
    if (themeToggleLightIcon && themeToggleDarkIcon) {
        themeToggleLightIcon.classList.toggle('hidden', isDark); // 暗色模式隐藏亮色图标
        themeToggleDarkIcon.classList.toggle('hidden', !isDark); // 亮色模式隐藏暗色图标
    }
    // 切换 HTML 根元素的 'dark' 类
    htmlElement.classList.toggle('dark', isDark);
    // 将用户选择的主题保存到 localStorage
    localStorage.setItem('color-theme', isDark ? 'dark' : 'light');
}

// --- AOS 初始化 (用于非 Hero 部分的滚动动画) ---
function initializeAOS() {
    // 检查 AOS 库是否已加载
    if (typeof AOS === 'undefined') {
        console.error("AOS library not loaded!");
        return;
    }
    // 初始化 AOS
    AOS.init({
        duration: 800,          // 动画持续时间 (毫秒)
        easing: 'ease-out-cubic', // 动画缓动效果
        once: true,             // 动画是否只触发一次
        offset: 50,             // 触发动画的偏移量 (像素)
        delay: 0,               // 全局延迟 (毫秒)，GSAP 会处理入场，这里设为 0
        // disable: 'phone',    // 可选: 在手机上禁用 AOS
    });
    console.log("AOS initialized for non-hero sections"); // 控制台确认 AOS 初始化
}

// --- 平滑滚动初始化 ---
function initializeSmoothScroll() {
    // 选择所有 href 以 '#' 开头的锚点链接
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            // 确保目标 ID 有效且不是单纯的 '#'
            if (targetId && targetId.startsWith('#') && targetId.length > 1) {
                const targetElement = document.querySelector(targetId);
                // 确保目标元素存在
                if (targetElement) {
                    e.preventDefault(); // 阻止默认的锚点跳转行为

                    // 计算固定页眉的高度，以便滚动定位准确
                    const headerOffset = document.querySelector('header')?.offsetHeight || 64; // 获取 header 高度，若不存在则默认 64px
                    const elementPosition = targetElement.getBoundingClientRect().top; // 获取目标元素相对于视口的位置
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset; // 计算最终滚动位置

                    // 执行平滑滚动
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth" // 平滑滚动行为
                    });
                    console.log(`Smooth scrolling to: ${targetId}`); // 控制台输出滚动目标
                } else {
                    console.warn(`Smooth scroll target not found: ${targetId}`); // 警告：未找到目标元素
                }
            }
        });
    });
}


// --- GSAP 动画初始化 ---
function initializeGsapAnimations() {
    // 检查 GSAP 库是否已加载
    if (typeof gsap === 'undefined') {
        console.error("GSAP library not loaded!");
        return;
    }
    console.log("Initializing GSAP animations..."); // 控制台确认 GSAP 初始化

    // --- Hero Section 入场动画 (精确复制 DeepForest 逻辑) ---
    const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.8 } }); // 创建时间线，设置默认缓动和时长

    // 动画序列
    tl.fromTo('#hero-badge', // 目标：徽章
        { opacity: 0, y: -30, scale: 0.8 }, // 起始状态：透明，向上偏移，缩小
        { opacity: 1, y: 0, scale: 1, duration: 0.6, delay: 0.2 } // 结束状态：不透明，归位，正常大小 (持续时间较短，稍有延迟)
    )
        .fromTo('#hero-title-main', // 目标：主标题
            { opacity: 0, y: 40, skewX: -10 }, // 起始状态：透明，向下偏移，轻微倾斜
            { opacity: 1, y: 0, skewX: 0, duration: 1 }, // 结束状态：不透明，归位，不倾斜 (持续时间较长)
            "-=0.4" // 与上一个动画重叠 0.4 秒开始
        )
        .fromTo('#hero-title-sub', // 目标：副标题
            { opacity: 0, y: 30, scale: 0.9 }, // 起始状态：透明，向下偏移，略微缩小
            { opacity: 1, y: 0, scale: 1 }, // 结束状态：不透明，归位，正常大小
            "-=0.7" // 与上一个动画重叠 0.7 秒开始
        )
        .fromTo('#hero-desc', // 目标：描述文本
            { opacity: 0, y: 20 }, // 起始状态：透明，向下偏移
            { opacity: 1, y: 0, duration: 0.7 }, // 结束状态：不透明，归位 (持续时间中等)
            "-=0.5" // 与上一个动画重叠 0.5 秒开始
        )
        .fromTo('#hero-buttons > a', // 目标：按钮组内的所有链接 (按钮)
            { opacity: 0, y: 20, scale: 0.8 }, // 起始状态：透明，向下偏移，缩小
            { opacity: 1, y: 0, scale: 1, stagger: 0.15 }, // 结束状态：不透明，归位，正常大小，并以 0.15 秒的间隔交错出现
            "-=0.4" // 与上一个动画重叠 0.4 秒开始
        );

    console.log("GSAP Hero entrance animation configured."); // 控制台确认 Hero 动画配置

    // --- 全局背景 SVG 动画 (保持 DeepForest 逻辑) ---
    // 背景 SVG 1 动画
    gsap.to("#global-gradient-1-medi circle", { // 选择 SVG 内的 circle 元素
        duration: 45, // 动画持续时间 (较慢)
        rotation: 360, // 旋转 360 度
        scale: 1.15, // 轻微放大
        repeat: -1, // 无限重复
        yoyo: true, // 往返播放
        ease: "sine.inOut", // 平滑的正弦缓动
        svgOrigin: "500 500", // SVG 变换原点 (根据 SVG viewBox 中心设置)
        transformOrigin: "50% 50%" // CSS 变换原点
    });

    // 背景 SVG 2 动画
    gsap.to("#global-gradient-2-medi circle", { // 选择 SVG 内的 circle 元素
        duration: 55, // 不同的持续时间
        rotation: -360, // 反向旋转
        scale: 1.2, // 放大更多
        repeat: -1, // 无限重复
        yoyo: true, // 往返播放
        ease: "sine.inOut", // 平滑的正弦缓动
        svgOrigin: "450 450", // SVG 变换原点 (根据 SVG viewBox 中心设置)
        transformOrigin: "50% 50%" // CSS 变换原点
    });

    console.log("GSAP Global background animations started."); // 控制台确认背景动画启动

} // End initializeGsapAnimations