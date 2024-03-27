import { IPublicModelPluginContext } from '@alilc/lowcode-types';
import { BranchesOutlined, BuildOutlined } from '@ant-design/icons';
import { useSdk } from '@tenx-ui/yunti-bff-client';
import { useMatch } from '@umijs/max';
import { Avatar, Space, Tag, Typography, theme } from 'antd';
import React from 'react';

import {
  PREFERENCE_DECLARATION,
  PaneInjectProps,
  PluginRegisterOptions,
} from '@/components/Designer';
import { getTreeNames } from '@/utils';

import styles from './index.less';

const { Text } = Typography;

const ComponentMetaPane: React.FC<PaneInjectProps> = props => {
  // const { schema } = props;
  const antToken = theme.useToken();
  const { componentId } = useMatch({ path: 'design/components/:componentId' })?.params || {};
  const sdk = useSdk();
  const { data } = sdk.useGetComponent({ id: componentId });
  const { name: treeName, displayName: treeDisplayName } = getTreeNames(componentId);

  return (
    <Space className={styles.componentMeta}>
      <Avatar
        icon={<BuildOutlined />}
        shape="square"
        style={{ backgroundColor: antToken.token.colorPrimary }}
        title="低代码组件开发"
      />
      <Space className={styles.noWrap} title={data?.component?.description}>
        <Text ellipsis>{data?.component?.name}</Text>
        {treeDisplayName && (
          <Tag
            bordered={false}
            color="blue"
            icon={<BranchesOutlined />}
            style={{ marginInlineEnd: 0 }}
            title={treeName}
          >
            <Text ellipsis>{treeDisplayName}</Text>
          </Tag>
        )}
      </Space>
      {/* <Text type="secondary">{<RightOutlined />}</Text> */}
    </Space>
  );
};

const pluginName = 'PluginComponentMeta';
export const PluginComponentMeta = (
  ctx: IPublicModelPluginContext,
  options: PluginRegisterOptions
) => {
  const { injectPaneProps, injectPropsKeys } = options;
  return {
    name: pluginName,
    dep: [],
    // 插件的初始化函数，在引擎初始化之后会立即调用
    async init() {
      ctx.skeleton.add({
        area: 'topArea',
        type: 'Widget',
        name: pluginName,
        content: injectPaneProps(ComponentMetaPane, injectPropsKeys),
        props: {
          align: 'left',
          width: 88,
          ctx,
        },
      });
    },
  };
};

PluginComponentMeta.pluginName = pluginName;
PluginComponentMeta.meta = {
  preferenceDeclaration: PREFERENCE_DECLARATION,
};

export default PluginComponentMeta;
