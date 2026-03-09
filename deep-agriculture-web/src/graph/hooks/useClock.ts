// src/graph/hooks/useClock.ts
import { useState, useEffect } from 'react';

/**
 * 提供当前时间的 Hook
 * @returns {string} 当前时间字符串 (HH:MM:SS)
 */
export function useClock(): string {
    const [time, setTime] = useState<string>('--:--:--');

    useEffect(() => {
        // 更新时间的函数
        const update = () => {
            const now = new Date();
            const h = String(now.getHours()).padStart(2, '0');
            const m = String(now.getMinutes()).padStart(2, '0');
            const s = String(now.getSeconds()).padStart(2, '0');
            setTime(`${h}:${m}:${s}`);
        };

        update(); // 立即执行一次以显示初始时间
        const timerId = setInterval(update, 1000); // 每秒更新一次

        // 清理函数：组件卸载时清除定时器
        return () => clearInterval(timerId);
    }, []); // 空依赖数组表示此 effect 只在挂载和卸载时运行

    return time;
}