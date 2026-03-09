// src/analysis/components/DashboardHeader.tsx
"use client"; // 标记为客户端组件，因为使用了 useState 和 useEffect

import React, { useState, useEffect } from 'react';
import Icon from './common/Icon'; // 引入自定义的 Icon 组件
import { faTree, faUserCircle, faBell } from '@fortawesome/free-solid-svg-icons'; // 引入需要的图标

/**
 * DeepForest 数据分析仪表盘的头部组件。
 * 显示 Logo、标题、当前时间以及用户信息区域。
 */
const DashboardHeader: React.FC = () => {
  // 使用 state 来存储当前时间，初始值为 '--:--:--'
  const [currentTime, setCurrentTime] = useState<string>('--:--:--');

  // 使用 useEffect 来设置一个定时器，每秒更新时间
  useEffect(() => {
    // 设置定时器，每 1000 毫秒（1秒）执行一次更新时间的函数
    const timerId = setInterval(() => {
      const now = new Date(); // 获取当前时间
      // 格式化小时、分钟、秒，确保是两位数（例如：09 而不是 9）
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      // 更新 state 中的时间字符串
      setCurrentTime(`${hours}:${minutes}:${seconds}`);
    }, 1000);

    // **清理函数**：这个函数会在组件卸载时执行
    // 清除定时器，防止内存泄漏
    return () => clearInterval(timerId);
  }, []); // 空依赖数组 `[]` 表示这个 effect 只在组件首次挂载时运行一次

  // --- 事件处理函数 (占位符) ---
  // 用户图标点击事件处理
  const handleUserClick = () => {
    console.log("用户图标被点击");
    // 在实际应用中，这里可以触发打开用户菜单、跳转到个人资料页等操作
  };
  // 通知图标点击事件处理
  const handleNotificationClick = () => {
    console.log("通知图标被点击");
    // 在实际应用中，这里可以触发打开通知面板等操作
  };

  // --- 渲染组件 ---
  return (
    <header className="dashboard-header">
      {/* Logo 和标题区域 */}
      <div className="logo">
        {/* 使用 Icon 组件显示树图标 */}
        <Icon icon={faTree} className="icon" />
        {/* 显示仪表盘标题 */}
        <h1>DeepForest 数据分析</h1>
      </div>

      {/* 当前时间显示 */}
      <div className="time-display">
        {currentTime} {/* 显示 state 中的时间 */}
      </div>

      {/* 用户信息和操作区域 */}
      <div className="user-profile">
        {/* 用户图标，并绑定点击事件 */}
        <Icon icon={faUserCircle} className="icon" onClick={handleUserClick} />
        {/* 显示用户名（这里是静态的，可以替换为动态获取的用户名） */}
        <span>管理员</span>
        {/* 通知图标，并绑定点击事件 */}
        <Icon icon={faBell} className="icon" onClick={handleNotificationClick} />
      </div>
    </header>
  );
};

export default DashboardHeader; // 导出组件