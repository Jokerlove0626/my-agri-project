// src/chat/components/Sidebar/HistoryPreview.tsx
import React from 'react';
import type { HistoryGroupData } from '@/chat/types';

// 定义 HistoryItem 组件 props 类型
interface HistoryItemProps {
  id: string;
  title: string;
  isActive: boolean; // 是否是当前激活的对话
  onClick: (id: string) => void; // 点击处理函数
}

// 单个历史记录项组件
const HistoryItem: React.FC<HistoryItemProps> = ({ id, title, isActive, onClick }) => {
  return (
    <li className={isActive ? 'active' : ''}>
      {/* 使用 button 方便处理点击事件和无障碍 */}
      <button onClick={() => onClick(id)} title={title}>
        {title}
      </button>
    </li>
  );
};

// 定义 HistoryGroup 组件 props 类型
interface HistoryGroupProps {
  group: HistoryGroupData;
  activeChatId: string | null;
  onChatSelect: (id: string) => void;
}

// 历史记录分组组件
const HistoryGroup: React.FC<HistoryGroupProps> = ({ group, activeChatId, onChatSelect }) => {
  return (
    <div className="history-group">
      <span className="history-timeframe">{group.timeframe}</span>
      <ul className="history-list">
        {group.items.map((item) => (
          <HistoryItem
            key={item.id}
            id={item.id}
            title={item.title}
            isActive={item.id === activeChatId}
            onClick={onChatSelect}
          />
        ))}
      </ul>
    </div>
  );
};

// 定义 HistoryPreview 组件 props 类型
interface HistoryPreviewProps {
  historyGroups: HistoryGroupData[]; // 所有历史记录分组数据
  activeChatId: string | null; // 当前激活的对话 ID
  onChatSelect: (id: string) => void; // 选择对话的处理函数
}

/**
 * 侧边栏的历史记录预览区域组件
 * @param historyGroups - 包含所有分组和对话项的数据数组
 * @param activeChatId - 当前选中的对话 ID
 * @param onChatSelect - 用户点击选择某个对话时的回调函数
 */
const HistoryPreview: React.FC<HistoryPreviewProps> = ({ historyGroups, activeChatId, onChatSelect }) => {
  // 模拟数据，实际应用中应从状态管理或 API 获取
    const mockHistoryGroups: HistoryGroupData[] = [
        {
            timeframe: '当天',
            items: [{ id: 'chat1', title: '你好，今天天气怎么样？' }],
        },
        {
            timeframe: '最近30天',
            items: [
                { id: 'chat2', title: '【下图为scrapy爬虫的目录】' },
                { id: 'chat3', title: '你是什么模型？介绍一下你自己。' },
            ],
        },
        {
            timeframe: '最近半年',
            items: [
                { id: 'chat4', title: 'Java 如何高效切割字符串' },
                { id: 'chat5', title: '帮我写一个 React Hook' },
            ],
        },
    ];

  // 使用模拟数据或传入的 props 数据
  const displayGroups = historyGroups.length > 0 ? historyGroups : mockHistoryGroups;


  return (
    <div className="history-preview">
      {displayGroups.map((group, index) => (
        <HistoryGroup
          key={group.timeframe + index} // 使用 timeframe 和索引作为 key
          group={group}
          activeChatId={activeChatId}
          onChatSelect={onChatSelect}
        />
      ))}
      {/* 当没有历史记录时可以显示提示 */}
      {displayGroups.length === 0 && (
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8em', textAlign: 'center', marginTop: '20px' }}>
              暂无历史对话
          </p>
      )}
    </div>
  );
};

export default HistoryPreview;