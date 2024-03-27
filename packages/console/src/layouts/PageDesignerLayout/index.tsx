/**
 * 应用的 layout
 */
import { skeleton } from '@alilc/lowcode-engine';
import { AppstoreOutlined } from '@ant-design/icons';
import { useSdk } from '@tenx-ui/yunti-bff-client';
import { useMatch } from '@umijs/max';
import { Button } from 'antd';
import React from 'react';

import { LAYOUT_ACTIONS } from '@/pages/PageDesigner/plugins';

import BasicLayout, { BasicLayoutProps } from '../BasicLayout';

const PageDesignerLayout: React.FC = () => {
  const { appId } = useMatch({ path: '/design/apps/:appId', end: false })?.params || {};
  const sdk = useSdk();
  const { data: appData } = sdk.useGetApp({ id: appId });

  const openPanel = (name: string) => {
    skeleton.showPanel(name);
  };
  const layoutProps: BasicLayoutProps = {
    title: appData?.app?.name,
    appList: [],
    headerTitleProps: {
      subTitle: '页面设计',
      back: `/apps/${appId}/pages`,
      refresh: true,
      icon: <AppstoreOutlined />,
      tag: '应用',
    },
    actionsRender: () =>
      LAYOUT_ACTIONS.map(({ name, titile }) => (
        <Button
          className="yunti-action-render-editor-btn"
          key={name}
          onClick={() => openPanel(name)}
          size="large"
          type="text"
        >
          {titile}
        </Button>
      )),
    // actionsRender: () => [
    //   <Button className="yunti-action-render-editor-btn" key="config" type="text" size="large">全局设置</Button>,
    //   <Button className="yunti-action-render-editor-btn" key="utils-constants" type="text" size="large">全局上下文管理</Button>,
    //   <Button className="yunti-action-render-editor-btn" key="assets" type="text" size="large">资产配置</Button>,
    //   <Button className="yunti-action-render-editor-btn" key="i18n" type="text" size="large">多语言文案管理</Button>,
    //   <Button className="yunti-action-render-editor-btn" key="git" type="text" size="large">Git 提交面板</Button>,
    //   <Button className="yunti-action-render-editor-btn" key="schema" type="text" size="large">Schema</Button>,
    // ],
  };

  return <BasicLayout {...layoutProps} />;
};

export default PageDesignerLayout;
