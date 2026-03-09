// src/app/chat/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/chat/components/Sidebar/Sidebar';
import ChatArea from '@/chat/components/ChatArea/ChatArea';
import type { HistoryGroupData } from '@/chat/types';
import { fetchChatHistory } from '@/services/chatApi';
import '../globals.css';
import '@/chat/styles.css'; // 确保样式文件被引入
// 引入 antd 图标库中的 MenuOutlined
import { MenuOutlined } from '@ant-design/icons';
import { Button } from 'antd'; // 引入 antd 按钮 (可选, 也可以用普通 button)

export default function ChatPage() {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [historyGroups, setHistoryGroups] = useState<HistoryGroupData[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [chatAreaKey, setChatAreaKey] = useState<string>('new');

  // --- 新增状态：管理移动端侧边栏是否可见 ---
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // --- 新增函数：切换移动端侧边栏状态 ---
  const toggleMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(prev => !prev);
  }, []);

  // --- 新增函数：关闭移动端侧边栏（例如点击遮罩层） ---
  const closeMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(false);
  }, []);


  const loadHistory = useCallback(async () => {
      setIsLoadingHistory(true);
      try {
          const loadedHistory = await fetchChatHistory();
          setHistoryGroups(loadedHistory);
      } catch (error) {
          console.error("Failed to load chat history:", error);
      } finally {
          setIsLoadingHistory(false);
      }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleNewChat = useCallback(() => {
    console.log("New Chat requested");
    setActiveChatId(null);
    setChatAreaKey(`new-${Date.now()}`);
    closeMobileSidebar(); // 开始新聊天时关闭移动端侧边栏·1 请
  }, [closeMobileSidebar]); // 依赖 closeMobileSidebar

  const handleChatSelect = useCallback((id: string) => {
    console.log("Selected chat:", id);
    setActiveChatId(id);
    setChatAreaKey(id);
    closeMobileSidebar(); // 选择聊天时关闭移动端侧边栏
  }, [closeMobileSidebar]); // 依赖 closeMobileSidebar


  const handleChatStarted = useCallback((newChatId: string) => {
      console.log('New chat started with ID:', newChatId);
      loadHistory();
      setActiveChatId(newChatId);
      setChatAreaKey(newChatId);
      // 不需要关闭侧边栏，因为用户可能是在侧边栏打开时开始的新聊天
  }, [loadHistory]);

  const handleManageHistory = () => {
      console.log("Manage history action");
      // 可能需要关闭侧边栏
      closeMobileSidebar();
  };

  const handleUserProfileClick = () => {
       console.log("User profile action");
       // 可能需要关闭侧边栏
       closeMobileSidebar();
   };


  return (
    <div className={`app-container ${isMobileSidebarOpen ? 'mobile-sidebar-is-open' : ''}`}>
       {/* 移动端侧边栏遮罩层 */}
       {isMobileSidebarOpen && (
         <div
           className="mobile-sidebar-overlay"
           onClick={closeMobileSidebar} // 点击遮罩层关闭侧边栏
         ></div>
       )}

      {/* 左侧边栏 */}
      <Sidebar
        historyGroups={historyGroups}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onChatSelect={handleChatSelect}
        onManageHistory={handleManageHistory}
        onUserProfileClick={handleUserProfileClick}
        // --- 新增 Props ---
        isMobileOpen={isMobileSidebarOpen} // 传递打开状态
        onMobileClose={closeMobileSidebar} // 传递关闭函数
      />

      {/* 右侧聊天区域容器 (包含移动端触发按钮) */}
      <div className="main-content-area">
        {/* --- 新增：移动端侧边栏触发按钮 --- */}
        <Button
            className="mobile-sidebar-toggle"
            icon={<MenuOutlined />}
            onClick={toggleMobileSidebar}
            aria-label="Toggle sidebar" // 无障碍标签
            type="text" // 使用文本按钮样式，减少视觉干扰
        />

        {/* 聊天区域 */}
        <ChatArea
          key={chatAreaKey}
          chatId={activeChatId}
          onChatStarted={handleChatStarted}
        />
      </div>
    </div>
  );
}