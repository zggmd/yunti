/**
 * 应用的 layout
 */
import {
  AppstoreOutlined,
  BranchesOutlined,
  ContainerOutlined,
  SendOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';
import { useSdk } from '@tenx-ui/yunti-bff-client';
import { Link, useMatch } from '@umijs/max';
import React from 'react';

import BasicLayout, { BasicLayoutProps } from '../BasicLayout';

const AppsLayout: React.FC = () => {
  const { appId } = useMatch({ path: 'apps/:appId', end: false })?.params || {};
  const sdk = useSdk();
  const { data: appData } = sdk.useGetApp({ id: appId });
  const layoutProps: BasicLayoutProps = {
    title: appData?.app?.name,
    appList: [],
    headerTitleProps: {
      back: '/apps',
      icon: <AppstoreOutlined />,
      tag: '应用',
    },
    route: {
      path: '/apps',
      routes: [
        {
          path: `/apps/${appId}/pages`,
          name: '页面管理',
          icon: <ContainerOutlined style={{ fontSize: '14px' }} />,
        },
        {
          path: `/apps/${appId}/members`,
          name: '成员管理',
          icon: <UsergroupAddOutlined style={{ fontSize: '14px' }} />,
        },
        {
          path: `/apps/${appId}/branches`,
          name: '分支管理',
          icon: <BranchesOutlined style={{ fontSize: '14px' }} />,
          children: [
            {
              path: `/apps/${appId}/branches`,
              name: '分支管理',
              hideInMenu: true,
            },
            {
              path: `/apps/${appId}/merge`,
              name: '合并请求',
              hideInMenu: true,
            },
          ],
        },
        {
          name: '发布管理',
          path: `/apps/${appId}/publish-records`,
          icon: <SendOutlined style={{ fontSize: '14px' }} />,
          children: [
            {
              path: `/apps/${appId}/publish-records`,
              name: '发布记录',
              hideInMenu: true,
            },
            {
              path: `/apps/${appId}/publish-channels`,
              name: '组件仓库管理',
              hideInMenu: true,
            },
          ],
        },
      ],
    },
    menuItemRender: (item, dom) => (
      <Link style={{ fontSize: '14px' }} to={item.path}>
        {dom}
      </Link>
    ),
  };

  return <BasicLayout {...layoutProps} />;
};

export default AppsLayout;
