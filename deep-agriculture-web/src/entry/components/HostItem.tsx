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
  // 增加 HTMLSelectElement 的支持，让下拉框也能触发这个函数
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange(item.id, name as keyof Omit<HostEntryData, 'id'>, value);
  };

  return (
    <div className={styles.entryItem}>
      <div className={styles.formGrid}>
        <FormGroup label="受害作物学名（必填）">
          <input
            type="text"
            name="hostName"
            placeholder="如: Zea mays"
            value={item.hostName}
            onChange={handleChange}
          />
        </FormGroup>
        
        <FormGroup label="作物中文名">
          <input
            type="text"
            name="hostNameCn"
            placeholder="如: 玉米"
            value={item.hostNameCn}
            onChange={handleChange}
          />
        </FormGroup>
        
        <FormGroup label="作物类型（逗号分隔）">
          <input
            type="text"
            name="hostTypes" // 修复了原代码少一个 's' 的 Bug
            placeholder="如: 粮食作物, 经济作物"
            value={item.hostTypes}
            onChange={handleChange}
          />
        </FormGroup>
        
        <FormGroup label="寄主重要性">
          <select
            name="interactionType"
            value={item.interactionType}
            onChange={handleChange}
          >
            <option value="">-- 请选择 --</option>
            <option value="primary">主要寄主 (Primary)</option>
            <option value="secondary">次要寄主 (Secondary)</option>
            <option value="incidental">偶发寄主 (Incidental)</option>
          </select>
        </FormGroup>
        
        <FormGroup label="受害部位（多选请用逗号分隔）">
          <input
            type="text"
            name="plantParts"
            placeholder="如: 根, 茎, 叶, 花, 果实, 全株"
            value={item.plantParts}
            onChange={handleChange}
          />
        </FormGroup>
        
        <FormGroup label="危害级别 (减产程度)">
          <select
            name="infectionIntensity"
            value={item.infectionIntensity}
            onChange={handleChange}
          >
            <option value="">-- 请选择 --</option>
            <option value="low">轻度受害 (少量减产)</option>
            <option value="medium">中度危害 (明显减产)</option>
            <option value="high">严重危害 (大幅减产)</option>
            <option value="devastating">毁灭性危害 (绝收)</option>
          </select>
        </FormGroup>
      </div>
      
      <button
        type="button"
        className={styles.removeButton}
        onClick={() => onRemove(item.id)}
        aria-label="移除农作物记录" 
      >
        <FontAwesomeIcon icon={faTrashAlt} />
      </button>
    </div>
  );
};

export default HostItem;