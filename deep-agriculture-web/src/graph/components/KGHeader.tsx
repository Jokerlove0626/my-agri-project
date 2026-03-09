// src/graph/components/KGHeader.tsx
import React from 'react';
import Icon from './common/Icon';
import { faProjectDiagram, faUserCircle, faBell } from '@fortawesome/free-solid-svg-icons';
import styles from '../KnowledgeGraph.module.css'; // 引入页面样式
import { useClock } from '../hooks/useClock'; // 引入时钟 Hook

const KGHeader: React.FC = () => {
    const currentTime = useClock(); // 使用自定义 Hook 获取时间

    return (
        <header className={styles.kgHeader}>
            {/* Logo 和标题 */}
            <div className={styles.logoContainer}>
                <Icon icon={faProjectDiagram} className={styles.logoIcon} />
                <h1 className={styles.headerTitle}>DeepForest 知识图谱</h1>
            </div>

            {/* 时间显示 */}
            <div className={styles.timeDisplay}>{currentTime}</div>

            {/* 用户信息 */}
            <div className={styles.userProfile}>
                <Icon icon={faUserCircle} className={styles.userIcon} />
                <span className={styles.userName}>管理员</span>
                <Icon icon={faBell} className={styles.notificationIcon} />
            </div>
        </header>
    );
};

export default KGHeader;