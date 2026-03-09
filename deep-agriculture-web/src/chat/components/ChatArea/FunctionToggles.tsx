// src/chat/components/ChatArea/FunctionToggles.tsx
import React from 'react';
import Icon from '@/chat/components/common/Icon';

// 定义单个功能按钮的数据结构
interface FunctionToggle {
  id: string; // 唯一标识符
  label: string; // 显示的文本
  icon: React.ComponentProps<typeof Icon>['name']; // 图标名称
}

// 定义 FunctionToggles 组件 props 类型
interface FunctionTogglesProps {
  activeToggles: Set<string>; // 当前激活的功能 ID 集合
  onToggle: (id: string) => void; // 点击切换按钮时的回调
}

/**
 * 输入区域上方的功能切换按钮组
 * @param activeToggles - 一个包含当前激活的功能按钮 ID 的 Set
 * @param onToggle - 当用户点击某个功能按钮时触发的回调函数
 */
const FunctionToggles: React.FC<FunctionTogglesProps> = ({ activeToggles, onToggle }) => {
  // 定义可用的功能按钮
  const availableToggles: FunctionToggle[] = [
    { id: 'deep-thought', label: '深度思考', icon: 'Search' },
    { id: 'web-search', label: '联网搜索', icon: 'Globe' },
    { id: 'knowledge-graph', label: '知识图谱', icon: 'GitBranch' }, // 替换代码模式
    { id: 'report-generation', label: '报告生成', icon: 'FileText' }, // 替换PPT
    // 可以添加更多林业相关的功能
    // { id: 'pest-identification', label: '图像识别', icon: 'Camera' },
    // { id: 'gis-analysis', label: 'GIS分析', icon: 'MapPin' },
  ];

  return (
    <div className="function-toggles" id="function-toggles">
      {availableToggles.map((toggle) => (
        <button
          key={toggle.id}
          data-mode={toggle.id} // 保留 data-mode 属性，可能对 CSS 或其他逻辑有用
          className={activeToggles.has(toggle.id) ? 'active' : ''}
          aria-pressed={activeToggles.has(toggle.id)} // 无障碍属性
          onClick={() => onToggle(toggle.id)}
          title={toggle.label} // 鼠标悬停提示
        >
          <Icon name={toggle.icon} size={14} className="feather" />
          {toggle.label}
        </button>
      ))}
    </div>
  );
};

export default FunctionToggles;