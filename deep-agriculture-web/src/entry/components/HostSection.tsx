// src/entry/components/HostSection.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTree, faPlusCircle } from '@fortawesome/free-solid-svg-icons'; // 图标换成代表植物的 faTree
import AccordionItem from './AccordionItem';
import HostItem from './HostItem';
import styles from '../styles/EntryForm.module.css';
import { HostEntryData } from '../types';

interface HostSectionProps {
  items: HostEntryData[];
  onAdd: () => void;
  onRemove: (id: string | number) => void;
  onChange: (id: string | number, field: keyof Omit<HostEntryData, 'id'>, value: string) => void;
}

const HostSection: React.FC<HostSectionProps> = ({ items, onAdd, onRemove, onChange }) => {
  return (
    <AccordionItem title="受害农作物 (寄主) 数据" icon={faTree}>
      <div className={styles.dynamicEntrySection}>
        <div id="HostEntries">
          {items.map((item) => (
            <HostItem
              key={item.id}
              item={item}
              onRemove={onRemove}
              onChange={onChange}
            />
          ))}
        </div>
        <button type="button" className={styles.addButton} onClick={onAdd}>
          <FontAwesomeIcon icon={faPlusCircle} /> 添加农作物记录
        </button>
      </div>
    </AccordionItem>
  );
};

export default HostSection;