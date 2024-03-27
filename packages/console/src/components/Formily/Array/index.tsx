/**
 * Licensed Materials
 * (C) Copyright 2024 YuntiJS. All Rights Reserved.
 */

/*
 * ArrayTable.Remove
 *
 * @author Carrotzpc
 * @date 2023-02-07
 */
import { DeleteOutlined } from '@ant-design/icons';
import { ArrayField } from '@formily/core';
import { useField, useForm } from '@formily/react';
import { Button, ButtonProps } from 'antd';
import React, { forwardRef, useMemo } from 'react';

type CommonProps = ButtonProps & {
  index?: number;
  onRemove?: (record: Record<string, any>) => void;
};

export const Remove = forwardRef<HTMLButtonElement, CommonProps>((props, ref) => {
  const form = useForm();
  const field = useField();
  const { array, index } = useMemo(() => {
    const segments = [...field.path.segments];
    segments.pop();
    const _index = segments.pop() as number;
    // 注意：需要使用 ArrayField 本身的 remove 方法，
    // 使用 form.deleteValuesIn(segments) 及 form.setValues(values) 都会有问题
    const _array = form.fields[segments.join('.')] as ArrayField;
    return { array: _array, index: _index };
  }, [field.path.segments, form.fields]);
  return (
    <Button
      type="dashed"
      {...props}
      disabled={
        props.disabled === undefined ? array.value[index].actions?.remove?.disabled : props.disabled
      }
      onClick={e => {
        e.stopPropagation();
        props?.onRemove?.(array.value[index]);
        array.remove(index);
        if (props.onClick) {
          props.onClick(e);
        }
      }}
      ref={ref}
    >
      <DeleteOutlined />
    </Button>
  );
});
