// src/entry/components/AccordionItem.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import styles from '../styles/EntryForm.module.css';

interface AccordionItemProps {
  title: string;
  icon: IconDefinition;
  useGradientBg?: boolean; // 是否使用浅色渐变背景
  children: React.ReactNode;
  defaultOpen?: boolean; // 是否默认展开
}

const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  icon,
  useGradientBg = true, // 默认使用浅色渐变
  children,
  defaultOpen = false,
}) => {
  const titleClass = `${styles.accordionTitle} ${useGradientBg ? styles.gradientBgLight : ''}`;

  return (
    <details className={styles.accordionItem} open={defaultOpen}>
      <summary className={titleClass}>
        <FontAwesomeIcon icon={icon} />
        {title}
      </summary>
      <div className={styles.accordionContent}>
        {children}
      </div>
    </details>
  );
};

export default AccordionItem;