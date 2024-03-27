import { material } from '@alilc/lowcode-engine';
import { IPublicTypeAssetsJson } from '@alilc/lowcode-types';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { sdk } from '@tenx-ui/yunti-bff-client';
import { Button, Input, Popconfirm, Space, Typography } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { Table } from 'antd/lib';
import React, { useMemo, useState } from 'react';

import { LowCodePackage, PaneInjectProps } from '@/components/Designer/type';

import { getPkgIdFromComponent } from '../utils';
import UpsertModal, { UpsertModalProps } from './UpsertModal';
import styles from './index.less';

const { Text, Link } = Typography;

export interface PackagesManangementProps extends Pick<PaneInjectProps, 'id' | 'tree'> {
  onChange?: (packages: LowCodePackage[]) => Promise<void>;
  assets?: IPublicTypeAssetsJson;
}

const PackagesManangement: React.FC<PackagesManangementProps> = ({
  id,
  tree,
  assets,
  onChange,
}) => {
  // ~ 更新/添加公共函数
  const [upsertMode, setUpsertMode] = useState<UpsertModalProps['mode']>();
  const [upsertModalOpen, setUpsertModalOpen] = useState(false);
  const [initialValues, setInitialValues] = useState<UpsertModalProps['initialValues']>();
  const packages = useMemo(
    () =>
      assets.packages?.filter(p => {
        return (p as unknown as LowCodePackage).type?.toLowerCase() !== 'lowcode';
      }) || [],
    [assets.packages]
  );

  // @Todo: 可以增加 pkgDependents 的展示，可以知道这个依赖是被哪个低码组件引入的
  const columns: ColumnsType<LowCodePackage> = useMemo(
    () => [
      {
        title: 'npm 包',
        dataIndex: 'id',
        render: (_, record) => {
          const packageName = record.package || record.id;
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
        dataIndex: 'version',
      },
      {
        title: '全局变量名称',
        dataIndex: 'library',
        render: library => {
          if (!library) {
            return '-';
          }
          return <Text code>{library}</Text>;
        },
      },
      {
        title: '操作',
        dataIndex: 'actions',
        render: (_, record) => {
          const delBtnDisabled =
            record.type === 'lowCode' ||
            assets.components.some(c => getPkgIdFromComponent(c) === record.id);
          return (
            <Space>
              <Button
                disabled={record.type === 'lowCode'}
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
                description={`确定删除 ${record.package || record.name} 吗？`}
                disabled={delBtnDisabled}
                key="delete"
                onConfirm={() => {
                  return onChange(packages.filter(c => c.id !== record.id));
                }}
                title="删除 npm 包"
              >
                <Button
                  danger
                  disabled={delBtnDisabled}
                  icon={<DeleteOutlined />}
                  size="small"
                  type="dashed"
                />
              </Popconfirm>
            </Space>
          );
        },
      },
    ],
    [assets.components, packages, onChange]
  );

  return (
    <Space className={styles.ComponentsManangement} direction="vertical">
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
          添加 npm 包
        </Button>
      </Space>
      <Table
        columns={columns}
        dataSource={packages}
        pagination={{ pageSize: 20 }}
        rowKey="exportName"
        size="small"
      />
      <UpsertModal
        assets={assets}
        id={id}
        initialValues={initialValues}
        mode={upsertMode}
        onCancel={() => setUpsertModalOpen(false)}
        onSave={async (mode, values, oldValues) => {
          const newPackages = [...(assets?.packages || [])];
          let externalPkgsFull: LowCodePackage[] = [];
          const { externalsPkgs, ...pkg } = values;
          if (externalsPkgs?.length > 0) {
            const pkgUmdConfigList = await Promise.all(
              externalsPkgs.map(({ name, version }) =>
                sdk.getPackageUmdConfig({ name, version, id, tree })
              )
            );
            externalPkgsFull = pkgUmdConfigList
              .filter(pkgUmd => pkgUmd.package)
              .map(pkgUmd => pkgUmd.package)
              .map(p => ({
                package: p.name,
                version: p.version,
                library: p.umd?.library,
                urls: p.umd?.urls,
                editUrls: p.umd?.editUrls,
                meta: p.umd?.meta,
              }));
            for (const ep of externalPkgsFull) {
              const targetIndex = newPackages.findIndex(p => p.package === ep.package);
              if (targetIndex > -1) {
                newPackages[targetIndex] = ep;
              } else {
                newPackages.push(ep);
              }
            }
          }
          // 为设计器加载新的 package 资源
          // @Todo: 增量更新？目前加载太慢了
          await material.loadIncrementalAssets({
            version: '1.1.0',
            packages: [...externalPkgsFull, pkg],
            components: [],
          });
          if (mode === 'insert') {
            await onChange(newPackages.concat(pkg));
            setUpsertModalOpen(false);
            return;
          }
          const targetIndex = newPackages.findIndex(p => p.id === oldValues.id);
          newPackages[targetIndex] = pkg;
          await onChange(newPackages);
          setUpsertModalOpen(false);
        }}
        open={upsertModalOpen}
        tree={tree}
      />
    </Space>
  );
};

export default PackagesManangement;
