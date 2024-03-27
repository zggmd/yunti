import { TranslationOutlined } from '@ant-design/icons';
import { Form } from '@formily/core';
import { useExpressionScope, useField, useFieldSchema } from '@formily/react';
import { Button, Space, Tooltip, notification } from 'antd';
import React, { useState } from 'react';

import { DesignerProjectSchema } from '../../../../../components/Designer/type';
import {
  ErrItem,
  TranslatePayload,
  TranslatePayloadValue,
  TranslateResultItem,
  baiduTranslate,
  biyingTranslate,
  googleTranslate,
  youdaoTranslate,
} from './translate';

interface TranslateType {
  text: string;
  value: string;
  description?: string;
  configs: {
    [key: string]: {
      text: string;
      description?: string;
      default?: string;
    };
  };
  translate: ({ config, values }: TranslatePayload) => Promise<TranslateResultItem[] | ErrItem[]>;
  disabled?: boolean;
}
export const TRANSLATE_TYPES: TranslateType[] = [
  {
    text: '必应',
    value: 'bing',
    configs: {},
    translate: biyingTranslate,
  },
  {
    text: '百度',
    value: 'baidu',
    configs: {
      appid: {
        text: 'APP ID',
        default: '20220803001292685',
      },
      secret: {
        text: '密钥',
        default: '19Kxdh1bibvfsPduL9Qm',
      },
    },
    translate: baiduTranslate,
    disabled: true,
  },
  {
    text: '谷歌',
    value: 'google',
    configs: {},
    translate: googleTranslate,
    disabled: true,
  },
  {
    text: '有道',
    value: 'youdao',
    configs: {
      appKey: {
        text: 'APP ID',
        default: '648a273b6cf70ad1',
      },
      key: {
        text: '密钥',
        default: 'AhSlT5xeuOOBgAeCCX1TbK0OuUGJTi6G',
      },
    },
    translate: youdaoTranslate,
    disabled: true,
  },
];

interface HandleTranslateProps {
  setLoading?: (loading?: boolean) => void;
  hasNotification?: boolean;
  values: TranslatePayloadValue[];
  type?: string;
  schema: DesignerProjectSchema;
}

export const handleTranslate = async ({
  setLoading = () => {},
  hasNotification = false,
  values,
  type = TRANSLATE_TYPES[0].value,
  schema,
}: HandleTranslateProps): Promise<TranslateResultItem[] | ErrItem[]> => {
  const config = schema?.config?.translate?.[type] || getDefaultConfig(type);

  const translate = TRANSLATE_TYPES.find(item => item.value === type)?.translate;
  if (values?.length < 1) {
    notification.warning({
      message: '暂无空数据',
    });
    return;
  }
  setLoading(true);
  const res = await translate({ config, values });
  const errList = res?.map(item => !item.enUS && item.zhCN)?.filter(item => item);
  errList?.length > 0 &&
    notification.warning({
      message: `翻译失败：${errList?.join(', ')}`,
    });
  hasNotification &&
    notification.success({
      message: `翻译成功：${res
        ?.map(item => item.enUS && item.zhCN)
        ?.filter(item => item)
        ?.join(', ')}`,
    });
  setLoading(false);
  return res || [];
};

const getDefaultConfig = (type?: string) => {
  type = type || TRANSLATE_TYPES[0]?.value;
  const config = {};
  const configs = TRANSLATE_TYPES.find(item => item.value === type)?.configs;
  Object.keys(configs || {})?.map(key => {
    config[key] = configs[key].default;
  });
  return config;
};
interface SingleProps {
  type?: string;
  schema: DesignerProjectSchema;
  value: {
    i18nKey: string;
    zhCN: string;
  };
  callback: (res: TranslateResultItem) => void;
}
const Single = (props: SingleProps) => {
  const field = useField();
  const scope = useExpressionScope();
  const fieldschema = useFieldSchema().compile(scope);
  const {
    type = TRANSLATE_TYPES[0].value,
    schema,
    value,
    callback,
  } = fieldschema['x-component-props'] || props || {};
  const translate = TRANSLATE_TYPES.find(item => item.value === type)?.translate;
  const config = schema?.config?.translate?.[type] || getDefaultConfig(type);
  const [loading, setLoading] = useState(false);
  return (
    <Tooltip title="翻译">
      <Button
        loading={loading}
        onClick={async () => {
          setLoading(true);
          const res = await translate({ config, values: [value] });
          setLoading(false);
          if (!res?.[0]?.enUS) {
            notification.warning({
              message: '翻译失败',
            });
            return;
          }
          callback(res?.[0]);
        }}
      >
        <TranslationOutlined />
      </Button>
    </Tooltip>
  );
};
interface TranslateProps {
  schema: DesignerProjectSchema;
  i18nForm: Form;
  // onSchemaSave?: (schema: object) => Promise<DesignerProjectSchema>;
  i18nUsage?: object;
}

const Translate = (props: TranslateProps) => {
  const [type, setType] = useState(TRANSLATE_TYPES[0].value);
  const [loading, setLoading] = useState(false);
  return (
    <Space size={8}>
      {/* <Select value={type} onChange={v => setType(v)}>
        {TRANSLATE_TYPES.map(item => (
          <Select.Option disabled={item.disabled} key={item.value} value={item.value}>
            {item.text}
          </Select.Option>
        ))}
      </Select> */}
      <Tooltip title="仅支持英文空数据翻译">
        <Button
          ghost
          loading={loading}
          onClick={async () => {
            const { schema, i18nForm } = props;
            const values = i18nForm.values.array
              ?.map((item, index) => ({ ...item, index }))
              ?.filter(
                item =>
                  !item.enUS &&
                  item.zhCN &&
                  i18nForm.values.delList.every(delKey => item.i18nKey !== delKey)
              )
              ?.map(({ index, zhCN }) => {
                return {
                  i18nKey: index,
                  zhCN,
                };
              });
            const res = await handleTranslate({
              setLoading,
              values,
              type,
              schema,
            });
            if (res)
              for (const item of res) {
                i18nForm.setValuesIn(['array', item.i18nKey, 'enUS'], item.enUS);
              }
          }}
          type="primary"
        >
          翻译
        </Button>
      </Tooltip>
      {/* <Config type={type} {...props} /> */}
    </Space>
  );
};

Translate.Single = Single;
export default Translate;
