// src/entry/components/FormGroup.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import styles from '../styles/EntryForm.module.css'; // 使用主 CSS Module

interface FormGroupProps {
  label: string;
  icon?: IconDefinition; // FontAwesome 图标定义
  htmlFor?: string; // Input ID for label association
  fullWidth?: boolean; // 是否占据整行
  children: React.ReactNode; // Input, Select, Textarea, etc.
}

const FormGroup: React.FC<FormGroupProps> = ({
  label,
  icon,
  htmlFor,
  fullWidth = false,
  children,
}) => {
  const groupClass = `${styles.formGroup} ${fullWidth ? styles.fullWidth : ''}`;

  return (
    <div className={groupClass}>
      <label htmlFor={htmlFor}>
        {icon && <FontAwesomeIcon icon={icon} />}
        {label}:
      </label>
      {children}
    </div>
  );
};

export default FormGroup;