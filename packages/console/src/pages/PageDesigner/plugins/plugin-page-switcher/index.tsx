import { IPublicModelPluginContext } from '@alilc/lowcode-types';
import { BranchesOutlined, DownOutlined, RightOutlined } from '@ant-design/icons';
import { GetAppQuery, useSdk } from '@tenx-ui/yunti-bff-client';
import { history, useMatch } from '@umijs/max';
import { Dropdown, MenuProps, Space, Typography } from 'antd';
import React, { useEffect, useState } from 'react';

import { TREE_DEFAULT, getTreeById, getTreeNames } from '@/utils';

import styles from './index.less';

const { Text } = Typography;

export interface PageSwitcherProps {
  config: {
    props: {
      ctx: IPublicModelPluginContext;
    };
  };
}

const PageSwitcher: React.FC<PageSwitcherProps> = props => {
  // const antToken = theme.useToken();
  const [page, setPage] = useState<GetAppQuery['app']['pages'][0]>();
  const { appId, pageId } = useMatch({ path: 'design/apps/:appId/pages/:pageId' })?.params || {};
  const tree = getTreeById(appId);
  const sdk = useSdk({ tree });
  const { data: dataMain } = sdk.useGetApp({ id: appId, tree: TREE_DEFAULT });
  const { data } = sdk.useGetApp({ id: appId, tree });
  const { name: treeName, displayName: treeDisplayName } = getTreeNames(appId);

  useEffect(() => {
    if (!data?.app) {
      return;
    }
    setPage(data.app.pages?.find(p => p.id === pageId));
  }, [data?.app, pageId]);

  const items: MenuProps['items'] = data?.app?.pages?.map(({ id, title }) => ({
    key: id,
    label: title,
  }));
  const onSelect: MenuProps['onSelect'] = ({ key }) => {
    // @Todo: 应该在关闭源码面板前做一下保存
    props.config.props.ctx.event.emit('skeleton.panel-dock.unactive', 'codeEditor');
    // 切换前先关闭源码面板以及大纲树面板
    props.config.props.ctx.skeleton.hidePanel('codeEditor');
    props.config.props.ctx.skeleton.hidePanel('outline-master-pane');
    props.config.props.ctx.skeleton.hidePanel('outline-backup-pane');
    setPage(data?.app?.pages?.find(p => p.id === key));
    history.push(`/design/apps/${appId}/pages/${key}`);
  };

  return (
    <Space className={styles.pageSwitcher}>
      {/* <Avatar
        style={{ backgroundColor: antToken.token.colorPrimary }}
        shape="square"
        icon={<LayoutOutlined />}
        title="低代码页面开发"
      /> */}
      <Space className={styles.noWrap} title={dataMain?.app?.description}>
        {/* <Text ellipsis>{dataMain?.app?.name}</Text> */}
        {/* {treeDisplayName && (
          <Tag
            title={treeName}
            style={{ marginInlineEnd: 0 }}
            icon={<BranchesOutlined />}
            color="blue"
            bordered={false}
          >
            <Text ellipsis>{treeDisplayName}</Text>
          </Tag>
        )} */}
        {treeDisplayName && (
          <Space title={treeName}>
            <BranchesOutlined />
            <Text ellipsis>{treeDisplayName}</Text>
          </Space>
        )}
      </Space>
      <Text ellipsis type="secondary">
        {<RightOutlined />}
      </Text>
      <Dropdown
        menu={{
          style: { width: 200 },
          items,
          selectable: true,
          onSelect,
          selectedKeys: [page?.id],
        }}
      >
        <Space>
          <Typography.Link ellipsis>{page?.title}</Typography.Link>
          <DownOutlined style={{ fontSize: 10 }} />
        </Space>
      </Dropdown>
      <Text className={styles.noWrap} type="secondary">
        路由：
        <Text className={styles.pathname} copyable ellipsis type="secondary">
          {page?.pathname}
        </Text>
      </Text>
    </Space>
  );
};

const pluginName = 'PluginPageSwitcher';
export const PluginPageSwitcher = (ctx: IPublicModelPluginContext) => {
  return {
    name: pluginName,
    dep: [],
    // 插件的初始化函数，在引擎初始化之后会立即调用
    async init() {
      ctx.skeleton.add({
        area: 'topArea',
        type: 'Widget',
        name: pluginName,
        content: PageSwitcher,
        props: {
          align: 'left',
          width: 88,
          ctx,
        },
      });
    },
  };
};

PluginPageSwitcher.pluginName = pluginName;

export default PluginPageSwitcher;
