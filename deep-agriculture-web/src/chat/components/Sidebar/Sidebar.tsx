// src/chat/components/Sidebar/Sidebar.tsx
import React from 'react';
import Icon from '@/chat/components/common/Icon';
import HistoryPreview from './HistoryPreview';
import NavLinks from './NavLinks';
import type { HistoryGroupData } from '@/chat/types';
// 引入 antd 图标库中的 CloseOutlined
import { CloseOutlined } from '@ant-design/icons';
import { Button } from 'antd'; // 可选

// 定义 Sidebar 组件 props 类型
interface SidebarProps {
  historyGroups: HistoryGroupData[];
  activeChatId: string | null;
  onNewChat: () => void;
  onChatSelect: (id: string) => void;
  onManageHistory: () => void;
  onUserProfileClick: () => void;
  // --- 新增 Props ---
  isMobileOpen: boolean;    // 接收移动端打开状态
  onMobileClose: () => void; // 接收关闭函数
}

const Sidebar: React.FC<SidebarProps> = ({
  historyGroups,
  activeChatId,
  onNewChat,
  onChatSelect,
  onManageHistory,
  onUserProfileClick,
  // --- 解构新增 Props ---
  isMobileOpen,
  onMobileClose,
}) => {
  return (
    // --- 根据 isMobileOpen 动态添加 'open' 类名 ---
    <nav className={`sidebar ${isMobileOpen ? 'open' : ''}`}>
      {/* 侧边栏头部 */}
      <div className="sidebar-header">
         {/* --- 新增：移动端关闭按钮 --- */}
        <Button
            className="sidebar-close-btn" // 类名用于 CSS 控制显隐
            icon={<CloseOutlined />}
            onClick={onMobileClose} // 点击调用关闭函数
            aria-label="Close sidebar"
            type="text" // 使用文本按钮减少干扰
        />
        {/* <div className="logo">DeepForest</div> */}
        <button className="new-chat-btn" onClick={onNewChat}>
          <Icon name="Plus" size={16} className="feather" /> 新建对话
        </button>
      </div>

      {/* 历史记录预览 */}
      <HistoryPreview
        historyGroups={historyGroups}
        activeChatId={activeChatId}
        onChatSelect={onChatSelect}
      />

      {/* 主要导航链接 (如果需要，可以在移动端隐藏或调整) */}
      <NavLinks />

      {/* 侧边栏底部 */}
      <div className="sidebar-footer">
        <button className="manage-history" onClick={onManageHistory}>
          <Icon name="Settings" size={16} className="feather" /> 管理对话记录
        </button>
        <button className="user-profile" title="用户" onClick={onUserProfileClick}>
          <Icon name="User" size={18} className="feather" />
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;