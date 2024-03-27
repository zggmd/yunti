import { SettingOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, notification } from 'antd';
import { cloneDeep, set } from 'lodash';
import React, { useEffect, useState } from 'react';

import { DesignerProjectSchema } from '../../../../../components/Designer/type';
import { TRANSLATE_TYPES } from './index';

interface ConfigProps {
  type: string;
  schema: DesignerProjectSchema;
  onSchemaSave?: (schema: object) => Promise<DesignerProjectSchema>;
}

const Config = (props: ConfigProps) => {
  const [form] = Form.useForm();
  const { type, onSchemaSave, schema } = props;
  const [open, setOpen] = useState(false);
  const typeInfo = TRANSLATE_TYPES?.find(item => item.value === type);
  const configs = props?.schema?.config?.translate;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const config = configs?.[type];
    form.setFieldsValue(config);
  }, [configs, form, type]);

  return (
    <>
      <Button icon={<SettingOutlined />} onClick={() => setOpen(true)}></Button>
      <Modal
        destroyOnClose
        okButtonProps={{ loading }}
        onCancel={() => setOpen(false)}
        onOk={() => {
          form.validateFields().then(async values => {
            setLoading(true);
            const newSchema = cloneDeep(schema);
            set(newSchema, `config.translate.${type}`, values);
            await onSchemaSave(newSchema);
            setOpen(false);
            setLoading(false);
            notification.success({ message: `修改【${typeInfo.text}】翻译配置成功` });
          });
        }}
        open={open}
        title={`【${typeInfo.text}】翻译配置`}
      >
        <Form colon={false} form={form} labelAlign="left" labelCol={{ span: 4 }}>
          {Object.keys(typeInfo.configs).map(key => {
            const label = typeInfo.configs[key].text || key;
            return (
              <Form.Item
                initialValue={typeInfo.configs[key].default}
                key={key}
                label={label}
                name={key}
                rules={[
                  {
                    validator: (_, value, callback) => {
                      if (!value) {
                        return callback(`请输入${label}`);
                      }
                      callback();
                    },
                  },
                ]}
              >
                <Input placeholder={`请输入${label}`} />
              </Form.Item>
            );
          })}
        </Form>
      </Modal>
    </>
  );
};
export default Config;
