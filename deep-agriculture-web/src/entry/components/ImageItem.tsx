// src/entry/components/ImageItem.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import FormGroup from './FormGroup';
import styles from '../styles/EntryForm.module.css';
import { ImageEntryData } from '../types';

interface ImageItemProps {
  item: ImageEntryData;
  onRemove: (id: string | number) => void;
  onChange: (id: string | number, field: keyof Omit<ImageEntryData, 'id'>, value: string) => void;
}

const ImageItem: React.FC<ImageItemProps> = ({ item, onRemove, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange(item.id, name as keyof Omit<ImageEntryData, 'id'>, value);
  };

  return (
    <div className={styles.entryItem}>
      <div className={styles.formGrid}>
        <FormGroup label="标题">
          <input
            type="text"
            name="title"
            value={item.title}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup label="图片类型">
          <input
            type="text"
            name="type"
            value={item.type}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup label="存储路径">
          <input
            type="text"
            name="path"
            value={item.path}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup label="内容描述" fullWidth>
          <input
            type="text"
            name="contentDescription"
            value={item.contentDescription}
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

export default ImageItem;