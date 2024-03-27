import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import ProList from '@ant-design/pro-list';
import { Button, Col, Popconfirm, Row, Tooltip, Typography } from 'antd';
import React, { useMemo, useState } from 'react';

import CodeBlock from '@/components/CodeBlock';
import { DesignerProjectSchema } from '@/components/Designer/type';

import { ConstantsSchema } from '../../helper';
import ConstantsUpsertModal, {
  ConstantsUpsertModalProps,
  ConstantsUpsertModalValues,
} from './UpsertModal';

const { Text } = Typography;

export interface ConstantsPaneProps {
  constants?: ConstantsSchema;
  onSave: (constants: ConstantsSchema) => Promise<DesignerProjectSchema>;
}

const ConstantsPane: React.FC<ConstantsPaneProps> = ({ constants = {}, onSave }) => {
  const [searchValue, setSearchValue] = useState<string>();
  const dataSource = useMemo(() => {
    const constantsArray = Object.keys(constants).map(key => {
      return {
        name: key,
        ...constants[key],
      };
    });
    if (!searchValue) {
      return constantsArray;
    }
    return constantsArray.filter(item =>
      item.name.toLowerCase().includes(searchValue.trim().toLowerCase())
    );
  }, [constants, searchValue]);

  // ~ 更新/添加常量
  const [upsertMode, setUpsertMode] = useState<ConstantsUpsertModalProps['mode']>();
  const [upsertModalOpen, setUpsertModalOpen] = useState(false);
  const [initialValues, setInitialValues] = useState<ConstantsUpsertModalValues>();
  const onConstantsSave = async (
    mode: ConstantsUpsertModalProps['mode'],
    values: ConstantsUpsertModalValues,
    oldValues: ConstantsUpsertModalValues
  ) => {
    const { name, ...otherValues } = values;
    const newConstants = { ...constants };
    if (mode === 'update') {
      delete newConstants[oldValues.name];
    }
    await onSave({
      ...newConstants,
      [name]: {
        type: 'JSExpression',
        ...otherValues,
      },
    });
    setUpsertModalOpen(false);
  };

  return (
    <div className="plugin-app-helper-constants">
      <ProList<(typeof dataSource)[number]>
        dataSource={dataSource}
        metas={{
          title: {
            dataIndex: 'name',
            render: text => (
              <Text copyable={{ text: `this.constants.${text}` }} ellipsis strong>
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
                <Col span={18}>
                  <div>值</div>
                  <div>
                    <Text
                      ellipsis={{ tooltip: <CodeBlock code={record.value} /> }}
                      type="secondary"
                    >
                      {record.value}
                    </Text>
                  </div>
                </Col>
                <Col span={6}>
                  <div>模拟值</div>
                  <div>
                    {record.mock ? (
                      <Text code ellipsis type="secondary">
                        {record.mock}
                      </Text>
                    ) : (
                      '-'
                    )}
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
                description={`确定删除常量 ${record.name} 吗？`}
                disabled={record.builtin}
                key="delete"
                onConfirm={() => {
                  delete constants[record.name];
                  return onSave(constants);
                }}
                title="删除常量"
              >
                <Button disabled={record.builtin} icon={<DeleteOutlined />} type="dashed" />
              </Popconfirm>,
            ],
          },
        }}
        rowKey="name"
        toolbar={{
          title: '全局常量',
          tooltip: (
            <>
              排在后面的常量可以使用前面的常量作为依赖，通过 <Text code>this</Text> 来读取其他常量，
              例如 <Text code>this.IS_PROD</Text>
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
      <ConstantsUpsertModal
        constants={constants}
        initialValues={initialValues}
        mode={upsertMode}
        onCancel={() => {
          setUpsertModalOpen(false);
        }}
        onSave={onConstantsSave}
        open={upsertModalOpen}
      />
    </div>
  );
};

export default ConstantsPane;
