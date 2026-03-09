// src/entry/components/ImageSection.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkedAlt, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import AccordionItem from './AccordionItem';
import ImageItem from './ImageItem';
import styles from '../styles/EntryForm.module.css';
import { ImageEntryData } from '../types';

interface ImageSectionProps {
  items: ImageEntryData[];
  onAdd: () => void;
  onRemove: (id: string | number) => void;
  onChange: (id: string | number, field: keyof Omit<ImageEntryData, 'id'>, value: string) => void;
}

const ImageSection: React.FC<ImageSectionProps> = ({ items, onAdd, onRemove, onChange }) => {
  return (
    <AccordionItem title="图片信息" icon={faMapMarkedAlt}>
      <div className={styles.dynamicEntrySection}>
        <div id="ImageEntries">
          {items.map((item) => (
            <ImageItem
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

export default ImageSection;