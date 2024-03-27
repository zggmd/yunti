import { ColorPicker, ColorPickerProps } from 'antd';
import { Color } from 'antd/es/color-picker';
import React from 'react';

export type ColorStringPickerProps = Omit<ColorPickerProps, 'onChange'> & {
  onChange?: (value: string) => void;
};

const ColorStringPicker: React.FC<ColorStringPickerProps> = ({ onChange, ...colorPickProps }) => {
  const colorPickerOnchange = (color: Color) => {
    let colorString: string;
    switch (colorPickProps.format) {
      case 'hex': {
        colorString = color.toHexString();
        break;
      }
      case 'hsb': {
        colorString = color.toHsbString();
        break;
      }
      case 'rgb':
      default: {
        colorString = color.toRgbString();
        break;
      }
    }
    onChange?.(colorString);
  };
  return <ColorPicker {...colorPickProps} onChange={colorPickerOnchange} />;
};

export default ColorStringPicker;
