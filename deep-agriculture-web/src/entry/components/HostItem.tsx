// src/entry/components/HostItem.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import FormGroup from './FormGroup';
import styles from '../styles/EntryForm.module.css';
import { HostEntryData } from '../types';

interface HostItemProps {
  item: HostEntryData;
  onRemove: (id: string | number) => void;
  onChange: (id: string | number, field: keyof Omit<HostEntryData, 'id'>, value: string) => void;
}

const HostItem: React.FC<HostItemProps> = ({ item, onRemove, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange(item.id, name as keyof Omit<HostEntryData, 'id'>, value);
  };

  return (
    <div className={styles.entryItem}>
      <div className={styles.formGrid}>
        <FormGroup label="学名（必填）">
          <input
            type="text"
            name="hostName"
            value={item.hostName}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup label="中文名">
          <input
            type="text"
            name="hostNameCn"
            value={item.hostNameCn}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup label="类型（逗号分隔）">
          <input
            type="text"
            name="hostType"
            value={item.hostTypes}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup label="互作关系" fullWidth>
          <input
            type="text"
            name="interactionType"
            value={item.interactionType}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup label="危害部位（逗号分隔）" fullWidth>
          <input
            type="text"
            name="plantParts"
            value={item.plantParts}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup label="侵染强度" fullWidth>
          <input
            type="text"
            name="infectionIntensity"
            value={item.infectionIntensity}
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

export default HostItem;