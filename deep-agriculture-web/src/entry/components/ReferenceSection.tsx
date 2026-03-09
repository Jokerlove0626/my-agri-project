// src/entry/components/ReferenceSection.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkedAlt, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import AccordionItem from './AccordionItem';
import ReferenceItem from './ReferenceItem';
import styles from '../styles/EntryForm.module.css';
import { ReferenceEntryData } from '../types';

interface ReferenceSectionProps {
  items: ReferenceEntryData[];
  onAdd: () => void;
  onRemove: (id: string | number) => void;
  onChange: (id: string | number, field: keyof Omit<ReferenceEntryData, 'id'>, value: string) => void;
}

const ReferenceSection: React.FC<ReferenceSectionProps> = ({ items, onAdd, onRemove, onChange }) => {
  return (
    <AccordionItem title="引用文献" icon={faMapMarkedAlt}>
      <div className={styles.dynamicEntrySection}>
        <div id="ReferenceEntries">
          {items.map((item) => (
            <ReferenceItem
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

export default ReferenceSection;