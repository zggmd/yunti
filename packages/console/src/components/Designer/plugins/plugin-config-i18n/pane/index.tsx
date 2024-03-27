import { event, project } from '@alilc/lowcode-engine';
import { ArrayTable, Editable, FormButtonGroup, FormItem, Input, Submit } from '@formily/antd';
import { ArrayField, createForm, onFormInputChange } from '@formily/core';
import { FormProvider, createSchemaField } from '@formily/react';
import { Input as AntdInput, Space, message } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';

import { PaneInjectProps } from '@/components/Designer/type';
import { uuid } from '@/utils';

import { Remove, Text } from '../../../../Formily';
import File from '../file';
import Translate from '../translate';
import './index.less';

const TranslateSingle = Translate.Single;
const SchemaField = createSchemaField({
  components: {
    FormItem,
    Editable,
    Input,
    ArrayTable,
    Text,
    Remove,
    TranslateSingle,
    Space,
  },
});

interface PaneProps extends PaneInjectProps {
  project: any;
}
interface I18nForm {
  zhCN: string;
  enUS: string;
  i18nKey?: string;
  actions?: {
    remove?: {
      disabled: boolean;
    };
  };
}

interface StringObject {
  [key: string]: string;
}
const Pane: React.FC<PaneProps> = props => {
  const { schema, i18nUsage, onI18nSave } = props;
  const [isFormInputChanged, setIsFormInputChanged] = useState(false);
  const form = useMemo(
    () =>
      createForm({
        effects() {
          onFormInputChange(() => {
            setIsFormInputChanged(true);
          });
        },
      }),
    []
  );
  const [searchValue, setSearchValue] = useState<string>();
  const formatData = (data?: any) => {
    const i18n = data || props.project?.exportSchema()?.i18n;
    const i18nList: I18nForm[] = Object.keys(i18n?.['en-US'] || {})
      ?.filter(key => !form.values.delList.includes(key))
      ?.map(key => ({
        enUS: i18n?.['en-US']?.[key],
        zhCN: i18n?.['zh-CN']?.[key],
        i18nKey: key,
        actions: {
          remove: {
            disabled: Object.keys(i18nUsage?.[key] || {}).length > 0,
          },
        },
      }))
      ?.sort((a, b) => a.zhCN?.localeCompare(b.zhCN));
    if (!searchValue || !searchValue?.trim()) {
      return i18nList;
    }
    return i18nList?.filter(
      i =>
        i.enUS?.toLocaleLowerCase().includes(searchValue) ||
        i.zhCN?.toLocaleLowerCase().includes(searchValue)
    );
  };
  const setFormData = (data?: any) => {
    data = data || formatData();
    form.setValues({
      array: data,
    });
  };

  useEffect(() => {
    const updatePluginConfigI18n = async (payload: {
      i18nKey?: string;
      langKey: string;
      enUSValue?: string;
      value: string;
    }) => {
      const { i18nKey, langKey, enUSValue, value } = payload;
      // 更新 form 表单
      let index = form.values.array.findIndex(item => item.i18nKey === i18nKey);
      if (enUSValue) {
        index = form.values.array?.length;
        form.setValuesIn(['array', index, 'i18nKey'], i18nKey);
        form.setValuesIn(['array', index, 'enUS'], enUSValue);
        form.setValuesIn(['array', index, 'actions'], {
          remove: {
            disabled: true,
          },
        });
      }
      form.setValuesIn(['array', index, { 'en-US': 'enUS', 'zh-CN': 'zhCN' }[langKey]], value);
    };

    event.on('common:updatePluginConfigI18n', updatePluginConfigI18n);
    return () => {
      event.off('common:updatePluginConfigI18n', updatePluginConfigI18n);
    };
  }, []);

  useEffect(() => {
    if (!schema || isFormInputChanged) {
      return;
    }
    setFormData();
  }, [schema]);
  useEffect(() => {
    setFormData();
  }, [searchValue]);
  const onSearch = (value: string) => {
    setSearchValue(value);
  };
  const onSubmit = async (values: { array: I18nForm[] }) => {
    let enUSObject: StringObject = {};
    let zhCNObject: StringObject = {};
    if (values.array)
      for (const item of values.array) {
        const key = item.i18nKey || uuid('i18n');
        enUSObject[key] = item.enUS;
        zhCNObject[key] = item.zhCN;
      }
    enUSObject = Object.assign({}, schema?.i18n?.['en-US'], enUSObject);
    zhCNObject = Object.assign({}, schema?.i18n?.['zh-CN'], zhCNObject);
    form.values.delList.forEach((key: string) => {
      delete enUSObject[key];
      delete zhCNObject[key];
    });
    const i18n = await onI18nSave({
      'en-US': enUSObject,
      'zh-CN': zhCNObject,
    });
    setFormData(formatData(i18n));
    project.setI18n(i18n);
    message.success('保存成功');
    setIsFormInputChanged(false);
    event.emit('updateI18nSetter');
  };
  return (
    <div className="global-config-i18n">
      <FormProvider form={form}>
        <FormButtonGroup gutter={24} style={{ marginBottom: '16px' }}>
          <AntdInput.Search
            allowClear
            enterButton
            onSearch={onSearch}
            placeholder="搜索国际化文案"
            style={{ width: 270 }}
          />
          <Translate i18nForm={form} i18nUsage={i18nUsage} schema={schema} />
          <File i18nForm={form} i18nUsage={i18nUsage} schema={schema} />
          <Submit onSubmit={onSubmit}>保存</Submit>
        </FormButtonGroup>
        <SchemaField>
          <SchemaField.Array name="delList" />
          <SchemaField.Array
            name="array"
            x-component="ArrayTable"
            x-component-props={{
              pagination: {
                position: 'topRight',
                pageSize: 20,
                size: 'small',
                showTotal: total => `共 ${total} 条`,
              },
              scroll: { y: 'calc(100vh - 340px)' },
            }}
            x-decorator="FormItem"
          >
            <SchemaField.Object>
              <SchemaField.Void
                x-component="ArrayTable.Column"
                x-component-props={{ title: '中文', dataIndex: 'zhCN' }}
              >
                <SchemaField.String
                  name="zhCN"
                  required
                  x-component="Input"
                  x-component-props={{ placeholder: '请输入中文' }}
                  x-decorator="FormItem"
                />
              </SchemaField.Void>
              <SchemaField.Void
                x-component="ArrayTable.Column"
                x-component-props={{ title: '英文', dataIndex: 'enUS' }}
              >
                <SchemaField.String
                  name="enUS"
                  required
                  x-component="Input"
                  x-component-props={{ placeholder: '请输入英文' }}
                  x-decorator="FormItem"
                />
              </SchemaField.Void>
              <SchemaField.Void
                x-component="ArrayTable.Column"
                x-component-props={{ title: '唯一 id' }}
              >
                <SchemaField.String
                  name="i18nKey"
                  x-component="Text"
                  x-component-props={{
                    className: 'i18nKey',
                    ellipsis: { tooltip: '{{$record && $record.i18nKey}}' },
                    copyable: { text: '{{$record && $record.i18nKey}}' },
                  }}
                  x-decorator="FormItem"
                />
              </SchemaField.Void>
              <SchemaField.Void
                x-component="ArrayTable.Column"
                x-component-props={{
                  title: '操作',
                  dataIndex: 'operations',
                  fixed: 'right',
                  width: 120,
                }}
              >
                <SchemaField.Void x-component="Space" x-decorator="FormItem">
                  <SchemaField.Void
                    x-component="Remove"
                    x-component-props={{
                      onRemove: (record: I18nForm) => {
                        const delListField = form.fields['delList'] as ArrayField;
                        if (record.i18nKey) {
                          delListField.push(record.i18nKey);
                        }
                      },
                    }}
                    x-decorator="FormItem"
                  />
                  <SchemaField.Void
                    x-component="TranslateSingle"
                    x-component-props={{
                      schema,
                      value: {
                        i18nKey: '{{$record && $record.i18nKey}}',
                        zhCN: '{{$record && $record.zhCN}}',
                      },
                      callback: res => {
                        if (form.values?.array) {
                          for (const [i, item] of form.values.array.entries()) {
                            if (item.zhCN === res.zhCN && res.enUS) {
                              form.setValuesIn(['array', i, 'enUS'], res.enUS);
                            }
                          }
                        }
                      },
                    }}
                    x-decorator="FormItem"
                  />
                </SchemaField.Void>
              </SchemaField.Void>
            </SchemaField.Object>
            <SchemaField.Void title="新增文案 (请翻到最后一页)" x-component="ArrayTable.Addition" />
          </SchemaField.Array>
        </SchemaField>
      </FormProvider>
    </div>
  );
};

export default Pane;
