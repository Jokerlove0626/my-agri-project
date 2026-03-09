// src/entry/components/OtherNameItem.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import FormGroup from './FormGroup';
import styles from '../styles/EntryForm.module.css';
import { OtherNameEntryData } from '../types';

interface OtherNameItemProps {
  item: OtherNameEntryData;
  onRemove: (id: string | number) => void;
  onChange: (id: string | number, field: keyof Omit<OtherNameEntryData, 'id'>, value: string) => void;
}

const OtherNameItem: React.FC<OtherNameItemProps> = ({ item, onRemove, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange(item.id, name as keyof Omit<OtherNameEntryData, 'id'>, value);
  };

  return (
    <div className={styles.entryItem}>
      <div className={styles.formGrid}>
        <FormGroup label="名称类型">
          <input
            type="text"
            name="nameType"
            value={item.nameType}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup label="其他名称">
          <input
            type="text"
            name="otherName"
            value={item.otherName}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup label="明明年份">
          <input
            type="text"
            name="nameYear"
            value={item.namedYear}
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

export default OtherNameItem;