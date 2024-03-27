/**
 * 组件的 layout
 */
import {
  BranchesOutlined,
  BuildOutlined,
  TagsOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';
import { useSdk } from '@tenx-ui/yunti-bff-client';
import { Link, useLocation, useMatch } from '@umijs/max';
import React from 'react';

import BasicLayout, { BasicLayoutProps } from '../BasicLayout';
import GitTreeSelect from '../BasicLayout/components/GitTreeSelect';

const ComponentLayout: React.FC = () => {
  const location = useLocation();
  const { id } = useMatch({ path: 'components/:id', end: false })?.params || {};
  const enabledTreeSelectPaths = new Set([`/components/${id}/versions`]);
  const sdk = useSdk();
  const { data, loading } = sdk.useGetComponent({ id });
  const layoutProps: BasicLayoutProps = {
    title: data?.component?.name,
    appList: [],
    headerTitleProps: {
      back: '/components',
      icon: <BuildOutlined />,
      tag: '组件',
    },
    route: {
      path: '/components',
      routes: [
        {
          path: `/components/${id}/versions`,
          name: '版本管理',
          icon: <TagsOutlined style={{ fontSize: '14px' }} />,
        },
        {
          path: `/components/${id}/members`,
          name: '成员管理',
          icon: <UsergroupAddOutlined style={{ fontSize: '14px' }} />,
          disabled: true,
        },
        {
          path: `/components/${id}/branches`,
          name: '分支管理',
          icon: <BranchesOutlined style={{ fontSize: '14px' }} />,
          disabled: true,
        },
      ],
    },
    menuItemRender: (item, dom) => (
      <Link style={{ fontSize: '14px' }} to={item.path}>
        {dom}
      </Link>
    ),
    actionsRender: () => {
      return [
        <GitTreeSelect
          branches={data?.component?.branches}
          disabled={!enabledTreeSelectPaths.has(location.pathname)}
          id={id}
          key="tree"
          loading={loading}
        />,
      ];
    },
  };

  return <BasicLayout {...layoutProps} />;
};

export default ComponentLayout;
