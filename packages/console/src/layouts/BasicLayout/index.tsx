import {
  AppstoreOutlined,
  ArrowLeftOutlined,
  BuildOutlined,
  DownOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import type { ProLayoutProps } from '@ant-design/pro-layout';
import { ProLayout } from '@ant-design/pro-layout';
import type { Route } from '@ant-design/pro-layout/es/typing';
import { useSdk } from '@tenx-ui/yunti-bff-client';
import { Link, Outlet } from '@umijs/max';
import { Button, Divider, Dropdown, Space, Tag, Typography } from 'antd';
import React from 'react';

import logoImg from '@/assets/img/logo.svg';

import ChangeLocale from '../../components/ChangeLocale';
import './index.less';

export interface BasicLayoutProps {
  title?: string;
  route?: Route;
  appList?: ProLayoutProps['appList'];
  headerTitleProps?: {
    subTitle?: string;
    back: string;
    refresh?: boolean;
    icon: React.ReactNode;
    tag: string;
  };
  menuItemRender?: ProLayoutProps['menuItemRender'];
  actionsRender?: ProLayoutProps['actionsRender'];
}

const { Text } = Typography;

const appListDefault = [
  {
    icon: <AppstoreOutlined className="yunti-app-list-item-icon" />,
    title: (
      <Text className="yunti-app-list-item-title" strong>
        应用管理
      </Text>
    ),
    desc: '实现应用的可视化开发、发布等管理',
    url: '/apps',
  },
  {
    icon: <BuildOutlined className="yunti-app-list-item-icon" />,
    title: (
      <Text className="yunti-app-list-item-title" strong>
        组件管理
      </Text>
    ),
    desc: '实现组件的可视化开发、发布等管理',
    url: '/components',
  },
];
const headerTitleRenderDefault: ProLayoutProps['headerContentRender'] = logo => {
  return (
    <a href="/" title="云梯 yunti">
      {logo}
    </a>
  );
};
const menuItemRenderDefault = (item, dom) => (
  <a href={item.path} style={{ fontSize: '14px' }}>
    {dom}
  </a>
);
const actionsRenderDefault = () => {
  return [
    <Button
      href="http://kubebb.k8s.com.cn/docs/lowcode-development/intro"
      key="docs"
      rel="noreferrer"
      size="large"
      target="_blank"
      type="text"
    >
      帮助文档
    </Button>,
    <ChangeLocale key="ChangeLocale" />,
  ];
};

const BasicLayout: React.FC<BasicLayoutProps> = props => {
  const settings: ProLayoutProps = {
    fixSiderbar: true,
    layout: 'top',
    splitMenus: true,
    fixedHeader: true,
    token: {
      header: {
        colorTextMenuSelected: '#00b96b',
        colorBgMenuItemSelected: 'rgba(0,0,0,0.04)',
      },
      pageContainer: {
        colorBgPageContainer: '#ecf0f4',
        paddingInlinePageContainerContent: 0,
        paddingBlockPageContainerContent: 0,
      },
    },
  };

  const sdk = useSdk();
  const userData = sdk.useGetCurrentUser();

  const {
    title,
    appList = appListDefault,
    route,
    headerTitleProps,
    menuItemRender = menuItemRenderDefault,
    actionsRender,
  } = props;
  const headerTitleRender: ProLayoutProps['headerContentRender'] = (logo, defaultDom) => {
    if (!headerTitleProps) {
      return headerTitleRenderDefault(logo, defaultDom);
    }
    const { subTitle, back, refresh, icon, tag } = headerTitleProps;
    const backEle = (
      <Space className="layout-header-title-space-back">
        <ArrowLeftOutlined />
        <span>返回</span>
      </Space>
    );
    return (
      <Space className="layout-header-title-space">
        {refresh ? <a href={back}>{backEle}</a> : <Link to={back}>{backEle}</Link>}
        <Divider className="layout-header-title-space-divider" type="vertical" />
        <Space>
          {icon}
          <Text className="layout-title-h1" ellipsis title={title}>
            {title || '-'}
          </Text>
          <Tag color="gold">{tag}</Tag>
          {subTitle && <Divider className="layout-header-title-space-divider" type="vertical" />}
          {subTitle && (
            <Text className="layout-title-h1" ellipsis title={title}>
              {subTitle}
            </Text>
          )}
        </Space>
      </Space>
    );
  };

  return (
    <div
      id="yunti-layout"
      style={{
        height: '100vh',
      }}
    >
      <ProLayout
        actionsRender={headerViewProps => [
          ...((actionsRender && actionsRender(headerViewProps)) || []),
          actionsRender && (
            <Divider className="yunti-action-render-divider" key="divider" type="vertical" />
          ),
          ...actionsRenderDefault(),
        ]}
        appList={appList}
        avatarProps={{
          src: 'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
          size: 'large',
          title: userData?.data?.currentUser?.name,
          render: (_props, dom) => {
            return (
              <Dropdown
                className="yunti-header-avatar"
                menu={{
                  items: [
                    {
                      key: 'logout',
                      icon: <LogoutOutlined />,
                      label: '退出登录',
                    },
                  ],
                  onClick: e => {
                    switch (e.key) {
                      case 'logout':
                        window.location.href = `/logout?redirect=${window.location.origin}`;
                        break;
                      default:
                        break;
                    }
                  },
                }}
              >
                <Space>
                  {dom}
                  <DownOutlined />
                </Space>
              </Dropdown>
            );
          },
        }}
        breadcrumbRender={false}
        headerTitleRender={headerTitleRender}
        logo={logoImg}
        menu={{
          type: 'group',
        }}
        menuItemRender={menuItemRender}
        menuFooterRender={_props => {
          if (_props?.collapsed) return undefined;
          return (
            <div
              style={{
                textAlign: 'center',
                paddingBlockStart: 12,
              }}
            >
              <div>© 2023 Made with love</div>
              <div>by tenxcloud.com</div>
            </div>
          );
        }}
        // onMenuHeaderClick={(e) => console.log(e)}
        pageTitleRender={false}
        route={route}
        title={`云梯 yunti${title ? ` | ${title}` : ''}`}
        {...settings}
      >
        <div
          style={{
            height: 'calc(100vh - 40px)',
            minHeight: 800,
            padding: '0 0 16px 0',
          }}
        >
          <Outlet />
        </div>
      </ProLayout>
    </div>
  );
};

export default BasicLayout;
