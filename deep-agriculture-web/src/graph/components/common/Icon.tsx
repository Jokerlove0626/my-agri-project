// src/graph/components/common/Icon.tsx
import React from 'react';
import { FontAwesomeIcon, FontAwesomeIconProps } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core'; // 导入 IconProp 类型

// 定义 Icon 组件的 Props 接口
interface IconProps extends Omit<FontAwesomeIconProps, 'icon'> {
    icon: IconProp; // 使用正确的 IconProp 类型
}

/**
 * FontAwesome 图标的简单封装
 * @param {IconProps} props - 包含 icon 定义和其他 FontAwesomeIcon 属性
 */
const Icon: React.FC<IconProps> = ({ icon, ...rest }) => {
    return <FontAwesomeIcon icon={icon} {...rest} />;
};

export default Icon;