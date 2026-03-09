// src/entry/components/DistributionItem.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import FormGroup from './FormGroup';
import styles from '../styles/EntryForm.module.css';
import { DistributionEntryData } from '../types';

interface DistributionItemProps {
  item: DistributionEntryData;
  onRemove: (id: string | number) => void;
  onChange: (id: string | number, field: keyof Omit<DistributionEntryData, 'id'>, value: string) => void;
}

const DistributionItem: React.FC<DistributionItemProps> = ({ item, onRemove, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange(item.id, name as keyof Omit<DistributionEntryData, 'id'>, value);
  };

  return (
    <div className={styles.entryItem}>
      <div className={styles.formGrid}>
        <FormGroup label="大陆名称">
          <input
            type="text"
            name="continentName"
            value={item.continentName}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup label="国家名称">
          <input
            type="text"
            name="countryName"
            value={item.countryName}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup label="省份/州名称">
          <input
            type="text"
            name="provinceName"
            value={item.provinceName}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup label="分布状态描述" fullWidth>
          <input
            type="text"
            name="description"
            value={item.description}
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

export default DistributionItem;