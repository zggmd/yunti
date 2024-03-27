/**
 * Licensed Materials
 * (C) Copyright 2024 YuntiJS. All Rights Reserved.
 */

/*
 * Common components
 *
 * @author JN
 * @date 2021-04-20
 */
import { useExpressionScope, useField, useFieldSchema } from '@formily/react';
import { Typography } from 'antd';
import React from 'react';

type TextProps = typeof Typography.Text;

export const Text: React.FC<TextProps> = props => {
  const field = useField();
  const scope = useExpressionScope();
  const schema = useFieldSchema().compile(scope);
  const { children, ellipsis, ...otherProps } = schema['x-component-props'] || {};
  const fieldValue = schema?.name && schema?.type !== 'void' && field.value;
  const value = scope?.$record && schema['x-value'] ? schema['x-value'] : fieldValue || children;
  return (
    <Typography.Text
      {...otherProps}
      ellipsis={{ ...ellipsis, tooltip: ellipsis?.tooltip || value }}
    >
      {value || '-'}
    </Typography.Text>
  );
};

export default Text;
