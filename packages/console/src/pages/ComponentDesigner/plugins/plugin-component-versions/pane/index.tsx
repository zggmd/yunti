import { project } from '@alilc/lowcode-engine';
import { ThunderboltOutlined } from '@ant-design/icons';
import { Typography } from '@tenx-ui/materials';
import { GetComponentQuery, useSdk } from '@tenx-ui/yunti-bff-client';
import { useMatch } from '@umijs/max';
import { Button, Input, Space, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';

import { message } from '@/layouts';
import { TREE_DEFAULT, getTreeById } from '@/utils';

import { saveSchema } from '../../../utils';
import ReleaseModal from './ReleaseModal';
import './index.less';

const { Text } = Typography;

const columns: ColumnsType<GetComponentQuery['component']['versions']['0']> = [
  {
    title: '版本',
    dataIndex: 'version',
  },
  {
    title: '提交 id',
    dataIndex: 'commitId',
    render: (commitId: string) => (
      <Tooltip title={`打开当前版本: ${commitId.slice(0, 8)}`}>
        <a href={`${window.location.pathname}?tree=${commitId}`} rel="noreferrer" target="_blank">
          <code>{commitId.slice(0, 8)}</code>
        </a>
      </Tooltip>
    ),
  },
  {
    title: '版本描述',
    dataIndex: 'description',
    render: (text: string) => <Text>{text || '-'}</Text>,
  },
  {
    title: '发布时间',
    dataIndex: 'updateAt',
    render: (time: number) => <Typography.Time time={time} />,
  },
];

const ComponentVersionsPane: React.FC = () => {
  const { componentId } = useMatch({ path: 'design/components/:componentId' })?.params || {};
  const sdk = useSdk({ tree: getTreeById(componentId) });
  const { data, mutate } = sdk.useGetComponent({ id: componentId, tree: TREE_DEFAULT });
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);
  return (
    <div className="plugin-component-versions-pane">
      <Space className="plugin-component-versions-pane-actions">
        <Input.Search allowClear placeholder="请输入" />
        <Button
          icon={<ThunderboltOutlined />}
          onClick={() => setReleaseModalOpen(true)}
          type="primary"
        >
          发布版本
        </Button>
      </Space>
      <Table columns={columns} dataSource={data?.component?.versions || []} size="small" />

      <ReleaseModal
        component={data?.component}
        onCancel={() => {
          setReleaseModalOpen(false);
        }}
        onRelease={async values => {
          if (project.currentDocument.history.isSavePoint()) {
            await saveSchema({
              success: () => {},
              failed: () => {
                message.warning(`版本 ${values.version} 发布失败`);
              },
            });
          }
          await sdk.releaseComponent({
            release: {
              componentId: data?.component.id,
              ...values,
            },
          });
          setReleaseModalOpen(false);
          message.success(`版本 ${values.version} 发布成功`);
          mutate();
        }}
        open={releaseModalOpen}
      />
    </div>
  );
};

export default ComponentVersionsPane;
