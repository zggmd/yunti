import MonacoEditor from '@alilc/lowcode-plugin-base-monaco-editor';
import { IPublicTypePackage } from '@alilc/lowcode-types';
import { FunctionOutlined, WalletOutlined } from '@ant-design/icons';
import { Divider, Form, Input, Modal, Radio, Select, Switch, Typography } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';

import CodeBlock from '@/components/CodeBlock';

import { ComponentMap, UtilsSchema, UtilsSchemaItem, genUtilsCode } from '../../helper';

const { Text } = Typography;

export interface UtilsUpsertModalValues {
  name: string;
  description?: string;
  type: UtilsSchemaItem['type'];
  content: UtilsSchemaItem['content'];
  builtin?: boolean;
}
export interface UtilsUpsertModalProps {
  open: boolean;
  mode?: 'update' | 'insert';
  utils: UtilsSchema;
  initialValues?: UtilsUpsertModalValues;
  packages: IPublicTypePackage[];
  onSave: (
    mode: UtilsUpsertModalProps['mode'],
    values: UtilsUpsertModalValues,
    oldValues?: UtilsUpsertModalValues
  ) => Promise<void>;
  onCancel: () => void;
}

/** 集更新 (update) 和添加 (insert) 为一体的 Modal */
const UtilsUpsertModal: React.FC<UtilsUpsertModalProps> = ({
  open,
  mode = 'insert',
  initialValues,
  utils,
  packages,
  onSave,
  onCancel,
}) => {
  const [form] = Form.useForm<UtilsUpsertModalValues>();
  const [confirmLoading, setConfirmLoading] = useState(false);
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [form, initialValues]);
  const type = Form.useWatch('type', form);
  const name = Form.useWatch('name', form);
  const content = Form.useWatch('content', form) as ComponentMap;
  const code = useMemo(() => {
    if (!content || !content.package || !content.componentName || !content.exportName) {
      return;
    }
    return genUtilsCode(content);
  }, [content]);
  useEffect(() => form.setFieldValue(['content', 'componentName'], name), [form, name]);
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
      title={`${mode === 'insert' ? '添加' : '编辑'}函数`}
      width={640}
    >
      <Form
        form={form}
        initialValues={{ type: 'function' }}
        layout="vertical"
        name="upsert_utils_modal"
      >
        <Form.Item
          label="函数名"
          name="name"
          rules={[
            {
              required: true,
              pattern: /^[A-Z_a-z]\w*$/,
              message: '请输入函数名，函数名可由大小写字母、数字、字母组成，且不能以数字开头',
            },
            {
              validator: (_, value, callback) => {
                if (utils?.some(u => u.name === value)) {
                  if (mode === 'update' && value === initialValues.name) {
                    return callback();
                  }
                  return callback(`工具函数 ${value} 已存在，请使用其他函数名`);
                }
                callback();
              },
            },
          ]}
        >
          <Input disabled={initialValues?.builtin} placeholder="请输入函数名" />
        </Form.Item>
        <Form.Item label="描述" name="description" rules={[{ message: '请输入函数描述' }]}>
          <Input placeholder="请输入函数描述" />
        </Form.Item>
        <Form.Item label="类型" name="type" rules={[{ required: true, message: '请选择函数类型' }]}>
          <Radio.Group value="function">
            <Radio value="function">
              <FunctionOutlined /> function
            </Radio>
            <Radio value="npm">
              <WalletOutlined /> npm
            </Radio>
          </Radio.Group>
        </Form.Item>
        {type === 'function' ? (
          <Form.Item
            label="函数值"
            name={['content', 'value']}
            rules={[{ required: true, message: '请输入函数值' }]}
            tooltip={{
              overlayInnerStyle: {
                width: 360,
              },
              title: (
                <>
                  请输入 js 函数，可以使用其他工具函数作为依赖，通过 <Text code>this</Text>{' '}
                  来读取其他函数， 例如 <Text code>this.getAuthData</Text>
                </>
              ),
            }}
          >
            <MonacoEditor height="160px" language="javascript" supportFullScreen={true} />
          </Form.Item>
        ) : (
          <>
            <Form.Item
              label="npm 包"
              name={['content', 'package']}
              rules={[{ required: true, message: '请选择 npm 包' }]}
              tooltip="可以在“全局设置 > 三. 资产管理 > packages”中更改 npm 包"
            >
              <Select
                onSelect={pkg =>
                  form.setFieldValue(
                    ['content', 'version'],
                    packages.find(p => p.package === pkg).version
                  )
                }
                placeholder="请选择 npm 包"
                showSearch
              >
                {packages
                  ?.filter(p => p.type?.toLowerCase() !== 'lowcode')
                  .map(({ package: pkg, version = 'latest' }) => (
                    <Select.Option key={pkg}>
                      {pkg}@{version}
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>
            <Form.Item hidden label="npm 包版本" name={['content', 'version']} />
            <Form.Item
              label="从 npm 包引入的函数名"
              name={['content', 'exportName']}
              rules={[{ required: true, message: '请输入从 npm 包引入的函数名' }]}
              tooltip="即 npm 包导出的函数名，会通过这个函数名从 npm 包中引入"
            >
              <Input placeholder="请输入从 npm 包引入的函数名" />
            </Form.Item>
            <Form.Item hidden label="导出的函数名" name={['content', 'componentName']} />
            <Form.Item
              label="解构引入"
              name={['content', 'destructuring']}
              tooltip="是否使用解构方式从 npm 包中引入函数"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item
              label="下标子函数名称"
              name={['content', 'subName']}
              tooltip="当导出一个对象的子函数时需要指定"
            >
              <Input placeholder="请输入下标子函数名称" />
            </Form.Item>
            <Form.Item
              label="从 npm 包引入的函数文件路径"
              name={['content', 'main']}
              rules={[{ message: '请输入从 npm 包引入的函数文件路径' }]}
              tooltip="默认为 /，不需要指定"
            >
              <Input placeholder="请输入从 npm 包引入的函数文件路径" />
            </Form.Item>
            <Divider dashed />
            <Form.Item label="npm 类型工具函数预览：">
              <CodeBlock code={code} />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default UtilsUpsertModal;
