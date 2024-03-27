import { Col, ColProps, InputNumber, Row, Slider } from 'antd';
import React, { useState } from 'react';

export interface SliderInputProps {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  sliderCol?: ColProps;
  inputCol?: ColProps;
  addonAfter?: React.ReactNode;
}

const SliderInput: React.FC<SliderInputProps> = ({
  value,
  onChange,
  min = 0,
  max,
  sliderCol = { span: 12 },
  inputCol = { span: 5 },
  addonAfter,
}) => {
  const [number, setNumber] = useState(min);

  const onNumberChange = (newNumber: number) => {
    setNumber(newNumber);
    onChange?.(newNumber);
  };

  return (
    <Row>
      <Col {...sliderCol}>
        <Slider max={max} min={min} onChange={onNumberChange} value={value || number} />
      </Col>
      <Col {...inputCol}>
        <InputNumber
          addonAfter={addonAfter}
          max={max}
          min={min}
          onChange={onNumberChange}
          style={{ margin: '0 16px' }}
          value={value || number}
        />
      </Col>
    </Row>
  );
};

export default SliderInput;
