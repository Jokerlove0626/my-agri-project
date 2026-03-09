// src/entry/components/OtherNameSection.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkedAlt, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import AccordionItem from './AccordionItem';
import OtherNameItem from './OtherNameItem';
import styles from '../styles/EntryForm.module.css';
import { OtherNameEntryData } from '../types';

interface OtherNameSectionProps {
  items: OtherNameEntryData[];
  onAdd: () => void;
  onRemove: (id: string | number) => void;
  onChange: (id: string | number, field: keyof Omit<OtherNameEntryData, 'id'>, value: string) => void;
}

const OtherNameSection: React.FC<OtherNameSectionProps> = ({ items, onAdd, onRemove, onChange }) => {
  return (
    <AccordionItem title="物种别名" icon={faMapMarkedAlt}>
      <div className={styles.dynamicEntrySection}>
        <div id="OtherNameEntries">
          {items.map((item) => (
            <OtherNameItem
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

export default OtherNameSection;