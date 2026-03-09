// src/graph/components/QuerySidebar.tsx
import React, { useState } from 'react';
import Icon from './common/Icon';
import { faSearch, faCogs, faChartPie, faProjectDiagram, faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import styles from '../KnowledgeGraph.module.css'; // 引入页面样式

interface QuerySidebarProps {
    totalNodes: number | string;                // 总节点数
    totalEdges: number | string;                // 总关系数
    onSearch: (term: string) => void;           // 搜索回调
    onLayoutChange: (layout: 'force' | 'circular') => void; // 布局切换回调
    onShowLabelsChange: (show: boolean) => void; // 标签显示切换回调
    currentLayout: 'force' | 'circular';        // 当前布局
    showLabels: boolean;                         // 当前标签显示状态
}

const QuerySidebar: React.FC<QuerySidebarProps> = ({
    totalNodes,
    totalEdges,
    onSearch,
    onLayoutChange,
    onShowLabelsChange,
    currentLayout,
    showLabels
}) => {
    const [searchTerm, setSearchTerm] = useState(''); // 本地状态管理搜索词

    const handleSearchClick = () => {
        onSearch(searchTerm.trim());
    };

    const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSearchClick();
        }
    };

    return (
        <aside className={styles.querySidebar}>
            {/* 查询卡片 */}
            <div className={styles.kgCard}>
                <h3 className={styles.sidebarTitle}>
                    <Icon icon={faSearch} /> 图谱查询
                </h3>
                <div className={styles.queryArea}>
                    <input
                        type="text"
                        placeholder="搜索物种名、文献标题等..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        className={styles.searchInput}
                    />
                    <button onClick={handleSearchClick} className={styles.searchButton}>
                        <Icon icon={faSearch} />
                    </button>
                </div>
                <div className={styles.filterArea}>
                    <label htmlFor="nodeTypeFilter">节点类型:</label>
                    <select id="nodeTypeFilter" className={styles.filterSelect} defaultValue="all">
                        <option value="all">所有类型</option>
                        <option value="Species">物种 (Species)</option>
                        <option value="Reference">文献 (Reference)</option>
                        <option value="Location">地理位置 (Location)</option>
                        <option value="Taxonomy">分类单元 (Taxonomy)</option>
                        <option value="Host">寄主 (Host)</option>
                        <option value="File">文件 (File)</option>
                        <option value="Image">图片 (Image)</option>
                        {/* 可以根据实际 categories 动态生成 */}
                    </select>
                </div>
                <details className={styles.advancedQuery}>
                    <summary>高级查询 (Cypher)</summary>
                    <textarea
                        id="cypherQueryInput"
                        rows={3}
                        placeholder="输入 Cypher 查询语句..."
                        className={styles.cypherTextarea}
                    ></textarea>
                    <button className={styles.cypherButton}>执行</button>
                </details>
            </div>

            {/* 显示选项卡片 */}
            <div className={styles.kgCard}>
                <h3 className={styles.sidebarTitle}>
                    <Icon icon={faCogs} /> 显示选项
                </h3>
                <div className={styles.displayOptions}>
                    <div className={styles.layoutButtons}>
                        <button
                            onClick={() => onLayoutChange('force')}
                            className={`${styles.smallButton} ${currentLayout === 'force' ? styles.active : ''}`}
                        >
                            <Icon icon={faProjectDiagram} /> 力导引
                        </button>
                        <button
                            onClick={() => onLayoutChange('circular')}
                            className={`${styles.smallButton} ${currentLayout === 'circular' ? styles.active : ''}`}
                        >
                            <Icon icon={faCircleNotch} /> 环形
                        </button>
                    </div>
                    <label className={styles.toggleSwitch}>
                        <input
                            type="checkbox"
                            checked={showLabels}
                            onChange={(e) => onShowLabelsChange(e.target.checked)}
                        />
                        <span className={styles.slider}></span> 显示标签
                    </label>
                </div>
            </div>

            {/* 统计概览卡片 */}
            <div className={styles.kgCard}>
                <h3 className={styles.sidebarTitle}>
                    <Icon icon={faChartPie} /> 图谱概览
                </h3>
                <div className={styles.miniStats}>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>{totalNodes}</span>
                        <span className={styles.statLabel}>总节点</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>{totalEdges}</span>
                        <span className={styles.statLabel}>总关系</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default QuerySidebar;