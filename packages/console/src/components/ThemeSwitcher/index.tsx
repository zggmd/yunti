import { FloatButton, theme } from 'antd';
import { CompactTheme, DarkTheme, Light } from 'antd-token-previewer/es/icons';
import React, { FC } from 'react';

import ThemeIcon from './ThemeIcon';

const { defaultAlgorithm, darkAlgorithm, compactAlgorithm } = theme;

export type ThemeSwitchProps = {
  value: (typeof defaultAlgorithm)[];
  onChange: (value: (typeof defaultAlgorithm)[], types: string[]) => void;
};

const ThemeSwitch: FC<ThemeSwitchProps> = ({ value, onChange }) => {
  const getTypes = v => {
    const types = [];
    if (v.includes(darkAlgorithm)) {
      types.push('darkAlgorithm');
    }
    if (v.includes(defaultAlgorithm)) {
      types.push('defaultAlgorithm');
    }
    if (v.includes(compactAlgorithm)) {
      types.push('compactAlgorithm');
    }
    return types;
  };
  const handleLightSwitch = () => {
    let newValue = [...value];
    if (value.includes(darkAlgorithm)) {
      newValue = newValue.filter(item => item !== darkAlgorithm);
    }
    if (!value.includes(defaultAlgorithm)) {
      newValue.unshift(defaultAlgorithm);
    }
    onChange(newValue, getTypes(newValue));
  };

  const handleDarkSwitch = () => {
    let newValue = [...value];
    if (value.includes(defaultAlgorithm)) {
      newValue = newValue.filter(item => item !== defaultAlgorithm);
    }
    if (!value.includes(darkAlgorithm)) {
      newValue.push(darkAlgorithm);
    }
    onChange(newValue, getTypes(newValue));
  };

  const handleCompactSwitch = () => {
    if (value.includes(compactAlgorithm)) {
      const newValue = value.filter(item => item !== compactAlgorithm);
      onChange(newValue, getTypes(newValue));
    } else {
      const newValue = [...value, compactAlgorithm];
      onChange(newValue, getTypes([...value, compactAlgorithm]));
    }
  };

  return (
    <FloatButton.Group icon={<ThemeIcon />} trigger="click">
      <FloatButton
        icon={<Light />}
        onClick={handleLightSwitch}
        tooltip="Light"
        type={value.includes(defaultAlgorithm) ? 'primary' : 'default'}
      />
      <FloatButton
        icon={<DarkTheme />}
        onClick={handleDarkSwitch}
        tooltip="Dark"
        type={value.includes(darkAlgorithm) ? 'primary' : 'default'}
      />
      <FloatButton
        icon={<CompactTheme />}
        onClick={handleCompactSwitch}
        tooltip="Compact"
        type={value.includes(compactAlgorithm) ? 'primary' : 'default'}
      />
    </FloatButton.Group>
  );
};

export default ThemeSwitch;
