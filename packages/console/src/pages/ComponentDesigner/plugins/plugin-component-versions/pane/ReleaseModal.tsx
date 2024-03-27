import { GetComponentQuery } from '@tenx-ui/yunti-bff-client';
import { Form, Input, Modal, Switch } from 'antd';
import React, { useState } from 'react';

export interface ReleaseModalValues {
  version: string;
  description?: string;
  builtin?: boolean;
}
export interface ReleaseModalProps {
  open: boolean;
  onRelease: (values: ReleaseModalValues) => Promise<void>;
  onCancel: () => void;
  component: GetComponentQuery['component'];
}

const ReleaseModal: React.FC<ReleaseModalProps> = ({ open, onRelease, onCancel, component }) => {
  const [form] = Form.useForm<ReleaseModalValues>();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const force = Form.useWatch('force', form);
  return (
    <Modal
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      onOk={async () => {
        setConfirmLoading(true);
        try {
          const values = await form.validateFields();
          await onRelease(values);
        } catch (error) {
          setConfirmLoading(false);
          throw error;
        }
        setConfirmLoading(false);
        form.resetFields();
      }}
      open={open}
      title="发布版本"
      width={640}
    >
      <Form form={form} layout="vertical" name="release_modal">
        <Form.Item
          dependencies={['force']}
          label="版本号"
          name="version"
          rules={[
            {
              required: true,
              pattern:
                /^(\d+)\.(\d+)\.(\d+)(-[\dA-Za-z-]+(\.[\dA-Za-z-]+)*)?(\+[\dA-Za-z-]+(\.[\dA-Za-z-]+)*)?$/,
              message: '请输入版本号，格式为 X.Y.Z，其中 X 为主版本号，Y 为次版本号，Z 为修订号',
            },
            {
              validator: (_, value, callback) => {
                if (!force && component?.versions?.some(v => v.version === value)) {
                  return callback(`版本号 ${value} 已存在，请修改版本号`);
                }
                callback();
              },
            },
          ]}
          tooltip={
            <div>
              <p>
                版本号规则遵循语义化版本控制（Semantic Versioning，简称 SemVer），其格式为
                X.Y.Z，其中 X 为主版本号，Y 为次版本号，Z 为修订号。具体规则如下：
              </p>
              <div>
                <p> 1.主版本号：当做了不兼容的 API 修改时，将 X 置为 1，同时将 Y 和 Z 归零。</p>
                <p> 2.次版本号：当添加了向下兼容的功能时，将 Y 加 1，同时将 Z 归零。</p>
                <p> 3.修订号：当进行向下兼容的缺陷修复时，将 Z 加 1。</p>
              </div>
              <p>
                此外，还可以在版本号后面加上预发布标识符和构建元数据，例如：X.Y.Z-alpha.1+build.20220328。其中，预发布标识符以连字符“-”分隔，构建元数据以加号“+”分隔
              </p>
            </div>
          }
        >
          <Input placeholder="请输入版本号" />
        </Form.Item>
        <Form.Item label="描述" name="description" rules={[{ message: '请输入版本描述' }]}>
          <Input.TextArea placeholder="请输入版本描述" />
        </Form.Item>
        <Form.Item
          label="强制发布"
          name="force"
          tooltip="开启强制发布后，会覆盖已经存在的版本"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ReleaseModal;
