
import React from 'react';
import styles from './QuickFacts.module.css';

// 💡 这里的接口定义要和你的 types.ts 中的 taxonomy 结构对齐
interface QuickFactsProps {
  taxonomy: {
    rank: string;
    name: string;
    isCurrent?: boolean;
  }[];
}

/**
 * 侧边栏快速概览组件 - 展示生物分类阶元
 */
const QuickFacts: React.FC<QuickFactsProps> = ({ taxonomy }) => {
  if (!taxonomy || taxonomy.length === 0) {
    return <div className={styles.noData}>暂无分类信息</div>;
  }

  return (
    <div className={styles.quickFactsContainer}>
      <ul className={styles.taxonomyList}>
        {taxonomy.map((item, index) => (
          <li key={index} className={styles.taxonomyItem}>
            <span className={styles.rankLabel}>{item.rank}</span>
            <span className={styles.nameValue}>{item.name}</span>
            {item.isCurrent && <span className={styles.currentBadge}>当前</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};

// 💡 只要有了这行 export，报错就会立刻消失！
export default QuickFacts;