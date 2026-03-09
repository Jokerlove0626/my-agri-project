// src/entry/components/DistributionSection.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkedAlt, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import AccordionItem from './AccordionItem';
import DistributionItem from './DistributionItem';
import styles from '../styles/EntryForm.module.css';
import { DistributionEntryData } from '../types';

interface DistributionSectionProps {
  items: DistributionEntryData[];
  onAdd: () => void;
  onRemove: (id: string | number) => void;
  onChange: (id: string | number, field: keyof Omit<DistributionEntryData, 'id'>, value: string) => void;
}

const DistributionSection: React.FC<DistributionSectionProps> = ({ items, onAdd, onRemove, onChange }) => {
  return (
    <AccordionItem title="地理分布记录" icon={faMapMarkedAlt}>
      <div className={styles.dynamicEntrySection}>
        <div id="distributionEntries">
          {items.map((item) => (
            <DistributionItem
              key={item.id}
              item={item}
              onRemove={onRemove}
              onChange={onChange}
            />
          ))}
        </div>
        <button type="button" className={styles.addButton} onClick={onAdd}>
          <FontAwesomeIcon icon={faPlusCircle} /> 添加分布记录
        </button>
      </div>
    </AccordionItem>
  );
};

export default DistributionSection;