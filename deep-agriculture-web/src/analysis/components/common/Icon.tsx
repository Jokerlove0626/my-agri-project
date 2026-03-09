import React from 'react';
import { FontAwesomeIcon, FontAwesomeIconProps } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

interface IconProps extends Omit<FontAwesomeIconProps, 'icon'> {
    icon: IconProp;
}

const Icon: React.FC<IconProps> = ({ icon, ...rest }) => {
    return <FontAwesomeIcon icon={icon} {...rest} />;
};

export default Icon;