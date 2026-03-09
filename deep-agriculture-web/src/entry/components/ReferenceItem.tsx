// src/entry/components/ReferenceItem.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import FormGroup from './FormGroup';
import styles from '../styles/EntryForm.module.css';
import { ReferenceEntryData } from '../types';

interface ReferenceItemProps {
  item: ReferenceEntryData;
  onRemove: (id: string | number) => void;
  onChange: (id: string | number, field: keyof Omit<ReferenceEntryData, 'id'>, value: string) => void;
}

const ReferenceItem: React.FC<ReferenceItemProps> = ({ item, onRemove, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange(item.id, name as keyof Omit<ReferenceEntryData, 'id'>, value);
  };

  return (
    <div className={styles.entryItem}>
      <div className={styles.formGrid}>
        <FormGroup label="文献标识">
          <input
            type="text"
            name="icode"
            value={item.icode}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup label="标题">
          <input
            type="text"
            name="title"
            value={item.title}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup label="显示作者">
          <input
            type="text"
            name="authorDisplay"
            value={item.authorDisplay}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup label="引用类型" fullWidth>
          <input
            type="text"
            name="referenceType"
            value={item.referenceType}
            onChange={handleChange}
          />
        </FormGroup>
      </div>
      <button
        type="button"
        className={styles.removeButton}
        onClick={() => onRemove(item.id)}
        aria-label="移除分布记录"
      >
        <FontAwesomeIcon icon={faTrashAlt} />
      </button>
    </div>
  );
};

export default ReferenceItem;