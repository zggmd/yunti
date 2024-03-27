import { IPublicTypePackage } from '@alilc/lowcode-types';
import { DeleteOutlined, EditOutlined, FunctionOutlined, WalletOutlined } from '@ant-design/icons';
import ProList from '@ant-design/pro-list';
import { Button, Col, Popconfirm, Row, Tooltip, Typography } from 'antd';
import React, { useMemo, useState } from 'react';

import CodeBlock from '@/components/CodeBlock';
import { DesignerProjectSchema } from '@/components/Designer/type';

import { ComponentMap, JSFunction, UtilsSchema, UtilsSchemaItem, genUtilsCode } from '../../helper';
import UtilsUpsertModal, { UtilsUpsertModalProps, UtilsUpsertModalValues } from './UpsertModal';

const { Text } = Typography;

export interface UtilsPaneProps {
  utils?: UtilsSchema;
  packages?: IPublicTypePackage[];
  onSave: (utils: UtilsSchema) => Promise<DesignerProjectSchema>;
}

const UtilsPane: React.FC<UtilsPaneProps> = ({ utils = [], packages = [], onSave }) => {
  const [searchValue, setSearchValue] = useState<string>();
  const dataSource = useMemo(() => {
    if (!searchValue) {
      return utils;
    }
    return utils.filter(item => item.name.toLowerCase().includes(searchValue.trim().toLowerCase()));
  }, [utils, searchValue]);

  // ~ 更新/添加公共函数
  const [upsertMode, setUpsertMode] = useState<UtilsUpsertModalProps['mode']>();
  const [upsertModalOpen, setUpsertModalOpen] = useState(false);
  const [initialValues, setInitialValues] = useState<UtilsUpsertModalValues>();
  const onUtilsSave = async (
    mode: UtilsUpsertModalProps['mode'],
    values: UtilsUpsertModalValues,
    oldValues: UtilsUpsertModalValues
  ) => {
    const newUtils = [...utils];
    if (mode === 'update') {
      const target = newUtils.find(u => u.name === oldValues.name);
      if (values.type === 'function') {
        (values.content as JSFunction).type = 'JSFunction';
      }
      Object.assign(target, values);
    } else {
      newUtils.push(values);
    }
    await onSave(newUtils);
    setUpsertModalOpen(false);
  };

  const renderType = (type: UtilsSchemaItem['type']) => {
    switch (type) {
      case 'function': {
        return (
          <>
            <FunctionOutlined /> {type}
          </>
        );
      }
      default: {
        return (
          <>
            <WalletOutlined /> {type}
          </>
        );
      }
    }
  };
  const getContent = (record: UtilsSchemaItem) => {
    switch (record.type) {
      case 'function': {
        return (record.content as JSFunction).value;
      }
      default: {
        return genUtilsCode(record.content as ComponentMap);
      }
    }
  };
  return (
    <div className="plugin-app-helper-utils">
      <ProList<UtilsSchema[number]>
        dataSource={dataSource}
        metas={{
          title: {
            dataIndex: 'name',
            render: text => (
              <Text copyable={{ text: `this.utils.${text}` }} ellipsis strong>
                {text}
              </Text>
            ),
          },
          description: {
            dataIndex: 'description',
            render: (text, record) => (
              <Text ellipsis type="secondary">
                {record.builtin ? (
                  <Tooltip title="系统内置">⚙️</Tooltip>
                ) : (
                  <Tooltip title="自定义">✍️</Tooltip>
                )}
                &nbsp;{text}
              </Text>
            ),
          },
          content: {
            // dataIndex: 'content',
            render: (_, record) => (
              <Row gutter={8}>
                <Col span={7}>
                  <div>类型</div>
                  <div>
                    <Text type="secondary">{renderType(record.type)}</Text>
                  </div>
                </Col>
                <Col span={17}>
                  <div>函数值</div>
                  <div>
                    <Text
                      ellipsis={{
                        tooltip: <CodeBlock code={getContent(record)} />,
                      }}
                      type="secondary"
                    >
                      {getContent(record)}
                    </Text>
                  </div>
                </Col>
              </Row>
            ),
          },
          actions: {
            render: (_, record) => [
              <Button
                icon={<EditOutlined />}
                key="edit"
                onClick={() => {
                  setUpsertMode('update');
                  setInitialValues({ ...record });
                  setUpsertModalOpen(true);
                }}
                type="dashed"
              />,
              <Popconfirm
                description={`确定删除函数 ${record.name} 吗？`}
                disabled={record.builtin}
                key="delete"
                onConfirm={() => {
                  return onSave(utils.filter(u => u.name !== record.name));
                }}
                title="删除函数"
              >
                <Button danger disabled={record.builtin} icon={<DeleteOutlined />} type="dashed" />
              </Popconfirm>,
            ],
          },
        }}
        rowKey="name"
        toolbar={{
          title: '全局公共函数',
          tooltip: (
            <>
              可以使用其他工具函数作为依赖，通过 <Text code>this</Text> 来读取其他工具函数， 例如{' '}
              <Text code>this.getAuthData</Text>
            </>
          ),
          multipleLine: false,
          search: {
            onSearch: (value: string) => {
              setSearchValue(value);
            },
          },
          actions: [
            <Button
              key="primary"
              onClick={() => {
                setUpsertModalOpen(true);
                setUpsertMode('insert');
                setInitialValues();
              }}
              type="primary"
            >
              添加
            </Button>,
          ],
        }}
      />
      <UtilsUpsertModal
        initialValues={initialValues}
        mode={upsertMode}
        onCancel={() => {
          setUpsertModalOpen(false);
        }}
        onSave={onUtilsSave}
        open={upsertModalOpen}
        packages={packages}
        utils={utils}
      />
    </div>
  );
};

export default UtilsPane;
