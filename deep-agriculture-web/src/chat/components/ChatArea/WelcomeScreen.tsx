// src/chat/components/ChatArea/WelcomeScreen.tsx
import React from 'react';
import Image from 'next/image'; // 使用 Next.js Image 组件优化图片加载
import Icon from '@/chat/components/common/Icon';

// 定义 WelcomeScreen 组件 props 类型
interface WelcomeScreenProps {
    isHidden: boolean; // 控制是否隐藏
    onSuggestionClick: (prompt: string) => void; // 处理建议点击事件
    onChangePrompt: () => void; // 处理 "换一换" 点击事件
}

/**
 * 聊天区域的欢迎界面组件
 * 显示在没有聊天内容时
 * @param isHidden - 控制该屏幕是否可见
 * @param onSuggestionClick - 当用户点击某个建议卡片或按钮时触发，传递预设的 prompt
 * @param onChangePrompt - 当用户点击 "换一换" 链接时触发
 */
const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ isHidden, onSuggestionClick, onChangePrompt }) => {

    // 示例函数，根据点击的元素生成不同的提示语
    const handleSuggestion = (type: string, text?: string) => {
        let prompt = "";
        switch(type) {
            case 'tool':
                prompt = `请介绍一下 ${text || '这个工具'}`;
                break;
            case 'visual':
                prompt = `请介绍一下 ${text || '通义万相视频'}`;
                break;
            case 'agent':
                prompt = `请介绍一下智能体 ${text || 'Qwen-QwQ-32B'}`;
                break;
            case 'hot-search':
                prompt = `详细解读一下热搜 "${text || '网传朝鲜动向'}"`;
                break;
            default:
                prompt = "你好！";
        }
        onSuggestionClick(prompt);
    };

    return (
        <div className={`welcome-screen ${isHidden ? 'hidden' : ''}`}>
            {/* 欢迎头部 */}
            <div className="welcome-header">
                {/* 可以替换成 DeepForest 的 Logo SVG */}
                <div className="logo-container" style={{ display: 'flex', justifyContent: 'center', width: '100%' , marginBottom: '5px'}}>
                    <Image src="/deepforest.jpg" alt="DeepForest Logo" width={380} height={380} />
                </div>
                <h1>我是 DeepForest，你的林业智能助手</h1>
                <p>
                    我可以帮你解答林业病虫害问题，
                    <a onClick={onChangePrompt}>换一换 <Icon name="RefreshCw" size={12} className="feather" /></a>
                </p>
            </div>

            {/* 建议卡片区域 */}
            <div className="suggestion-cards">
                {/* 今日热搜卡片 (示例，内容可替换为林业相关) */}
                <div className="card today-hot">
                    <h3>林业热点</h3>
                    <p>近期林业领域关注焦点</p>
                    <ul>
                        {/* 示例热搜项，可以动态获取 */}
                        <li onClick={() => handleSuggestion('hot-search', '松材线虫病最新防治进展')}><span>1</span> 松材线虫病最新防治进展</li>
                        <li onClick={() => handleSuggestion('hot-search', '国家公园智慧林业建设')}><span>2</span> 国家公园智慧林业建设</li>
                        <li onClick={() => handleSuggestion('hot-search', '桉树快速生长技术研究')}><span>3</span> 桉树快速生长技术研究</li>
                        <li onClick={() => handleSuggestion('hot-search', '林下经济发展模式探讨')}><span>4</span> 林下经济发展模式探讨</li>
                        <li onClick={() => handleSuggestion('hot-search', '美国白蛾疫情监测预警')}><span>5</span> 美国白蛾疫情监测预警</li>
                    </ul>
                </div>

                {/* 效率工具卡片 (示例，内容可替换为林业相关) */}
                <div className="card efficiency-tools">
                    <h3>常用功能</h3>
                    <p>快速访问 DeepForest 核心能力</p>
                    <div className="tool-item" onClick={() => handleSuggestion('tool', '识别图片中的病虫害')}>
                        <Icon name="Camera" className="feather" />
                        <div>病虫害识别</div>
                        <span>上传图片，AI 快速识别</span>
                    </div>
                    <div className="tool-item" onClick={() => handleSuggestion('tool', '查询松材线虫的防治方法')}>
                        <Icon name="Search" className="feather" />
                        <div>知识查询</div>
                        <span>输入名称，获取详细防治方案</span>
                    </div>
                    <div className="tool-item" onClick={() => handleSuggestion('tool', '生成一份关于美国白蛾的防治报告')}>
                        <Icon name="FileText" className="feather" />
                        <div>报告生成</div>
                        <span>根据需求，智能生成分析报告</span>
                    </div>
                </div>

                {/* 精选智能体卡片 (示例，可以链接到特定的功能模块或知识库) */}
                <div className="card featured-agent">
                     <h3>知识图谱查询</h3>
                     <div className="agent-item" onClick={() => handleSuggestion('agent', '查询与松树相关的病害有哪些')}>
                        {/* 可以使用林业相关的 Logo 或图标 */}
                         <div style={{ width: '36px', height: '36px', borderRadius: '8px', marginRight: '12px', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                             <Icon name="GitBranch" size={20} color="#10B981" />
                         </div>
                         <div className="agent-info">
                             <h4>林业知识图谱</h4>
                             <p>探索实体关系，深入了解林业知识</p>
                         </div>
                     </div>
                 </div>

            </div>
        </div>
    );
};

export default WelcomeScreen;