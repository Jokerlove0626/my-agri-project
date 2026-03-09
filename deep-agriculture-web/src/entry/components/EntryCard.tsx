// src/entry/components/EntryCard.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import styles from '../styles/EntryForm.module.css'; // 使用主 CSS Module

interface EntryCardProps {
  title: string;
  icon?: IconDefinition;
  useGradientTitle?: boolean; // 是否使用渐变标题文字
  children: React.ReactNode;
  className?: string; // 允许传入额外的 class
}

const EntryCard: React.FC<EntryCardProps> = ({
  title,
  icon,
  useGradientTitle = false,
  children,
  className = '',
}) => {
  const titleClass = `${styles.cardTitle} ${useGradientTitle ? styles.gradientText : ''}`;
  const cardClass = `${styles.entryCard} ${className}`;

  return (
    <div className={cardClass}>
      <h2 className={titleClass}>
        {icon && <FontAwesomeIcon icon={icon} />}
        {title}
      </h2>
      {children}
    </div>
  );
};

export default EntryCard;