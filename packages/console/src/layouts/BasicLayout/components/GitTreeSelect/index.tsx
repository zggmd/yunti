import { BranchesOutlined } from '@ant-design/icons';
import { GetAppQuery, GetGitBranchesAndTagsQuery } from '@tenx-ui/yunti-bff-client';
import { Select, Space } from 'antd';
import React, { useState } from 'react';

import { getTreeById, setTree } from '@/utils';

// import { useSWRConfig } from 'swr';
import './index.less';

export interface GitTreeSelectProps {
  id: string;
  loading: boolean;
  disabled?: boolean;
  branches: GetAppQuery['app']['branches'];
  tags?: GetGitBranchesAndTagsQuery['git']['tags'];
  onTreeChange?: (tree: string) => any;
}

const GitTreeSelect: React.FC<GitTreeSelectProps> = props => {
  const [gitTree, setGitTree] = useState(getTreeById(props.id));
  // const { mutate, cache } = useSWRConfig();

  return (
    <Space className="git-tree-select">
      <BranchesOutlined />
      <Select
        bordered={false}
        disabled={props.disabled}
        loading={props.loading}
        onChange={value => {
          setGitTree(value);
          setTree(props.id, value);
          // @Todo: workaround
          window.location.reload();
          // mutate(
          //   (keys: string[]) => {
          //     return !keys?.includes('GetGitBranchesAndTags');
          //   },
          //   cache,
          //   { revalidate: true }
          // );
          // props.onTreeChange?.(value);
        }}
        placeholder="请选择分支或版本"
        showSearch
        value={gitTree}
      >
        <Select.OptGroup label="分支">
          {props.branches?.map(({ name, displayName }) => (
            <Select.Option key={name}>{displayName}</Select.Option>
          ))}
        </Select.OptGroup>
        {props.tags?.length > 0 && (
          <Select.OptGroup label="版本">
            {props.tags?.map(({ name }) => <Select.Option key={name}>{name}</Select.Option>)}
          </Select.OptGroup>
        )}
      </Select>
    </Space>
  );
};

export default GitTreeSelect;
