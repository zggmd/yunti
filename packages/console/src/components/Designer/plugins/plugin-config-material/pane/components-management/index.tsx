import { IPublicTypeAssetsJson, IPublicTypeRemoteComponentDescription } from '@alilc/lowcode-types';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Input, Popconfirm, Space, Typography } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { Table } from 'antd/lib';
import React, { useMemo, useState } from 'react';

import { LowCodePackaReference } from '@/components/Designer/type';

import { getPkgIdFromComponent } from '../utils';
import UpsertModal, { UpsertModalProps } from './UpsertModal';
import styles from './index.less';

const { Link } = Typography;

export interface ComponentsManangementProps {
  onChange?: (components: IPublicTypeRemoteComponentDescription[]) => Promise<void>;
  assets?: IPublicTypeAssetsJson;
}

const ComponentsManangement: React.FC<ComponentsManangementProps> = ({ assets, onChange }) => {
  // ~ 更新/添加公共函数
  const [upsertMode, setUpsertMode] = useState<UpsertModalProps['mode']>();
  const [upsertModalOpen, setUpsertModalOpen] = useState(false);
  const [initialValues, setInitialValues] = useState<UpsertModalProps['initialValues']>();

  const columns: ColumnsType<IPublicTypeRemoteComponentDescription> = useMemo(
    () => [
      {
        title: '组件',
        dataIndex: 'reference',
        render: (_, record) => {
          if (record.devMode?.toLowerCase() === 'lowcode') {
            return (
              <Link
                href={`/components/${record.reference?.id}/versions`}
                rel="noreferrer"
                target="_blank"
              >
                {(record.reference as unknown as LowCodePackaReference)?.name}(
                {record.reference?.id})
              </Link>
            );
          }
          const packageName = record.reference?.id;
          return (
            <Link
              href={`http://dev-unpkg.tenxcloud.net/${packageName}/`}
              rel="noreferrer"
              target="_blank"
            >
              {packageName}
            </Link>
          );
        },
      },
      {
        title: '版本',
        dataIndex: 'reference',
        render: (_, record) => {
          return (record.reference || record.npm)?.version;
        },
      },
      {
        title: '类型',
        dataIndex: 'devMode',
        render: devMode => {
          if (devMode?.toLowerCase() === 'lowcode') {
            return '低码组件';
          }
          return 'npm 组件';
        },
      },
      {
        title: '操作',
        dataIndex: 'actions',
        render: (_, record) => {
          return (
            <Space>
              <Button
                icon={<EditOutlined />}
                onClick={() => {
                  setUpsertMode('update');
                  setInitialValues({ ...record });
                  setUpsertModalOpen(true);
                }}
                size="small"
                type="dashed"
              />
              <Popconfirm
                description={`确定删除组件 ${getPkgIdFromComponent(record)} 吗？`}
                key="delete"
                onConfirm={() => {
                  return onChange(
                    (assets?.components || []).filter(
                      c => getPkgIdFromComponent(c) !== getPkgIdFromComponent(record)
                    )
                  );
                }}
                title="删除组件"
              >
                <Button danger icon={<DeleteOutlined />} size="small" type="dashed" />
              </Popconfirm>
            </Space>
          );
        },
      },
    ],
    [assets?.components, onChange]
  );

  return (
    <Space className={styles.componentsManangement} direction="vertical">
      <Space>
        <Input.Search allowClear placeholder="请输入" />
        <Button
          icon={<PlusOutlined />}
          onClick={() => {
            setUpsertModalOpen(true);
            setUpsertMode('insert');
            setInitialValues();
          }}
          type="primary"
        >
          添加组件
        </Button>
      </Space>
      <Table
        columns={columns}
        dataSource={assets?.components}
        pagination={{ pageSize: 20 }}
        rowKey="exportName"
        size="small"
      />
      <UpsertModal
        assets={assets}
        initialValues={initialValues}
        mode={upsertMode}
        onCancel={() => setUpsertModalOpen(false)}
        onSave={async (mode, values, oldValues) => {
          if (mode === 'insert') {
            await onChange((assets?.components || []).concat(values));
            setUpsertModalOpen(false);
            return;
          }
          const targetIndex = (assets?.components || []).findIndex(
            c => getPkgIdFromComponent(c) === getPkgIdFromComponent(oldValues)
          );
          const newComponents = [...(assets?.components || [])];
          newComponents[targetIndex] = values;
          await onChange(newComponents);
          setUpsertModalOpen(false);
        }}
        open={upsertModalOpen}
      />
    </Space>
  );
};

export default ComponentsManangement;
