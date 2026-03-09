// src/graph/components/InfoPanel.tsx
import React from 'react';
import Icon from './common/Icon';
import styles from '../KnowledgeGraph.module.css'; // 引入页面样式
import { faInfoCircle, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { EChartClickParams, GraphNode, GraphLink, GraphData } from '../types'; // 引入所需类型

interface InfoPanelProps {
    selectedItem: EChartClickParams | null; // 当前选中的节点或关系，可能为 null
    graphData: GraphData | null;           // 完整的图谱数据，用于查找节点名称
}

const InfoPanel: React.FC<InfoPanelProps> = ({ selectedItem, graphData }) => {

    const renderContent = () => {
        if (!selectedItem) {
            return <p className={styles.infoPlaceholder}>请在图谱中点击一个节点或关系以查看详细信息。</p>;
        }

        const { dataType, data } = selectedItem;
        const isNode = dataType === 'node';
        const details = data.details;
        const typeName = isNode ? '节点' : '关系';

        let name = '';
        if (isNode) {
            const node = data as GraphNode;
            name = node.name ? node.name.replace('\n', ' ') : node.id;
        } else {
            const link = data as GraphLink;
            if (graphData?.nodes) { // 确保 graphData 和 nodes 存在
                const sourceNode = graphData.nodes.find(n => n.id === link.source);
                const targetNode = graphData.nodes.find(n => n.id === link.target);
                const sourceName = sourceNode ? sourceNode.name.split('\n')[0] : link.source;
                const targetName = targetNode ? targetNode.name.split('\n')[0] : link.target;
                name = `${sourceName} → ${targetName}`;
            } else {
                name = `${link.source} → ${link.target}`; // Fallback if node names aren't available
            }
        }

        return (
            <>
                <h4 className={styles.infoTitle}>{`${typeName}信息: ${name}`}</h4>
                {!details ? (
                    <p>无详细信息。</p>
                ) : (
                    <ul className={styles.infoList}>
                        {Object.entries(details)
                            .filter(([key]) => key !== 'type') // 不重复显示类型
                            .map(([key, value]) => (
                                <li key={key} className={styles.infoListItem}>
                                    <span className={styles.infoProperty}>{key}:</span>
                                    <span className={styles.infoValue}>
                                        {formatValue(key, value)}
                                    </span>
                                </li>
                            ))}
                    </ul>
                )}
            </>
        );
    };

    // 格式化显示的值，特别是 URL、DOI 等
    const formatValue = (key: string, value: any) => {
        const valueStr = String(value); // 转换为字符串

        if ((key === 'url' || key === 'imagePath') && valueStr) {
            return (
                <a href={valueStr} target="_blank" rel="noopener noreferrer" title="打开链接">
                    {valueStr.length > 40 ? `${valueStr.substring(0, 37)}...` : valueStr}
                    &nbsp;<Icon icon={faExternalLinkAlt} size="xs" />
                </a>
            );
        } else if (key === 'doi' && valueStr) {
            return (
                <a href={`https://doi.org/${valueStr}`} target="_blank" rel="noopener noreferrer" title="打开DOI链接">
                    {valueStr}
                    &nbsp;<Icon icon={faExternalLinkAlt} size="xs" />
                </a>
            );
        } else if (typeof value === 'string' && valueStr.length > 150) {
            return (
                <span title={valueStr}>
                    {`${valueStr.substring(0, 147)}...`}
                </span>
            );
        }
        return valueStr; // 普通文本直接显示
    };


    return (
        <aside className={styles.infoAreaContainer}>
            <h3 className={styles.sidebarTitle}>
                <Icon icon={faInfoCircle} /> 详细信息
            </h3>
            <div className={styles.infoPanelContent}>
                {renderContent()}
            </div>
        </aside>
    );
};

export default InfoPanel;