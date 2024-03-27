import { config, material, project } from '@alilc/lowcode-engine';
import { filterPackages } from '@alilc/lowcode-plugin-inject';
import { IPublicModelPluginContext } from '@alilc/lowcode-types';
import { BlockOutlined } from '@ant-design/icons';
import { initSdk } from '@tenx-ui/yunti-bff-client';
import * as React from 'react';

import { default as saveAsBlock } from './action';
import { Block } from './common';
import { default as BlockPane } from './pane';

const pluginName = 'PluginBlockPanel';
export const PluginBlockPanel = (ctx: IPublicModelPluginContext) => {
  return {
    // 插件名，注册环境下唯一
    name: pluginName,
    // 依赖的插件（插件名数组）
    dep: [],
    // 插件对外暴露的数据和方法
    exports() {
      return {
        data: '',
        func: () => {},
      };
    },
    // 插件的初始化函数，在引擎初始化之后会立刻调用
    async init() {
      // 其他插件暴露的方法和属性
      // const { data, func } = ctx.plugins.pluginA;
      // 往引擎增加面板
      const blockPane = ctx.skeleton.add({
        area: 'leftArea',
        name: pluginName,
        type: 'PanelDock',
        props: {
          icon: <BlockOutlined className="icon" style={{ fontSize: '20px' }} />,
          title: '区块',
        },
        content: BlockPane,
      });
      blockPane?.disable?.();
      project.onSimulatorRendererReady(() => {
        blockPane?.enable?.();
      });
    },
  };
};

PluginBlockPanel.pluginName = pluginName;

export default PluginBlockPanel;

export const addSaveBlock = () => {
  const sdk = initSdk();
  material.addBuiltinComponentAction(saveAsBlock);
  config.set('apiList', {
    block: {
      createBlock: async (item: Block) => {
        const packages = await filterPackages(material.getAssets().packages);
        item.packages = packages;
        return sdk.createBlock({ block: item });
      },
      updateBlock: async (item: Block) => {
        const packages = await filterPackages(material.getAssets().packages);
        if (!item.packages) {
          item.packages = packages;
        }
        return sdk.updateBlock({ block: item });
      },
      deleteBlock: (id: string) => {
        return sdk.deleteBlock({ id });
      },
      listBlocks: async () => {
        const { blocks } = await sdk.getBlocks();
        return (blocks || []).map(b => {
          return {
            ...b,
            category: b.schema.category || 'OTHER',
            jsCode: b.schema.jsCode,
            schema: JSON.stringify(b.schema.schema || b.schema),
            created_at: b.createAt,
            updated_at: b.updateAt,
          };
        });
      },
    },
  });
};
