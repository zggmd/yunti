import MonacoEditor from '@alilc/lowcode-plugin-base-monaco-editor';
import { Form, Input, Modal, Typography } from 'antd';
import React, { useEffect, useState } from 'react';

import { ConstantsSchema } from '../../helper';

const { Text } = Typography;

export interface ConstantsUpsertModalValues {
  name: string;
  description?: string;
  value: string;
  mock?: string;
  builtin?: boolean;
}
export interface ConstantsUpsertModalProps {
  open: boolean;
  mode?: 'update' | 'insert';
  constants: ConstantsSchema;
  initialValues?: ConstantsUpsertModalValues;
  onSave: (
    mode: ConstantsUpsertModalProps['mode'],
    values: ConstantsUpsertModalValues,
    oldValues: ConstantsUpsertModalValues
  ) => Promise<void>;
  onCancel: () => void;
}

/** 集更新 (update) 和添加 (insert) 为一体的 Modal */
const ConstantsUpsertModal: React.FC<ConstantsUpsertModalProps> = ({
  open,
  mode = 'insert',
  initialValues,
  constants,
  onSave,
  onCancel,
}) => {
  const [form] = Form.useForm<ConstantsUpsertModalValues>();
  const [confirmLoading, setConfirmLoading] = useState(false);
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [form, initialValues]);
  return (
    <Modal
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      onOk={async () => {
        setConfirmLoading(true);
        try {
          const values = await form.validateFields();
          await onSave(mode, values, initialValues);
        } catch (error) {
          setConfirmLoading(false);
          throw error;
        }
        setConfirmLoading(false);
        form.resetFields();
      }}
      open={open}
      title={`${mode === 'insert' ? '添加' : '编辑'}常量`}
      width={640}
    >
      <Form form={form} layout="vertical" name="upsert_constants_modal">
        <Form.Item
          label="常量名"
          name="name"
          rules={[
            {
              required: true,
              pattern: /^[A-Z_a-z]\w*$/,
              message: '请输入常量名，常量名可由大小写字母、数字、字母组成，且不能以数字开头',
            },
            {
              validator: (_, value, callback) => {
                if (constants?.[value]) {
                  if (mode === 'update' && value === initialValues.name) {
                    return callback();
                  }
                  return callback(`变量 ${value} 已存在，请使用其他变量名`);
                }
                callback();
              },
            },
          ]}
        >
          <Input disabled={initialValues?.builtin} placeholder="请输入常量名" />
        </Form.Item>
        <Form.Item label="描述" name="description" rules={[{ message: '请输入常量描述' }]}>
          <Input placeholder="请输入常量描述" />
        </Form.Item>
        <Form.Item
          label="常量值"
          name="value"
          rules={[{ required: true, message: '请输入常量值' }]}
          tooltip={{
            overlayInnerStyle: {
              width: 360,
            },
            title: (
              <>
                请输入 js 值或表达式，排在后面的常量可以使用前面的常量作为依赖，通过{' '}
                <Text code>this</Text> 来读取其他常量， 例如 <Text code>this.IS_PROD</Text>
              </>
            ),
          }}
        >
          <MonacoEditor height="160px" language="javascript" supportFullScreen={true} />
        </Form.Item>
        <Form.Item
          label="模拟值"
          name="mock"
          tooltip="请输入模拟值，当常量是一个表达式的时候，可用于在编辑及预览时模拟常量值"
        >
          <MonacoEditor height="100px" language="javascript" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ConstantsUpsertModal;
