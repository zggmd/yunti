import { IPublicModelPluginContext } from '@alilc/lowcode-types';
import { Button } from 'antd';

import PluginComponentVersions from '../plugin-component-versions';

const pluginName = 'PluginComponentRelease';
export const PluginComponentRelease = (ctx: IPublicModelPluginContext) => {
  return {
    name: pluginName,
    dep: [],
    // 插件对外暴露的插件和方法
    exports() {
      return {};
    },
    // 插件的初始化函数，在引擎初始化之后会立即调用
    async init() {
      const { skeleton } = ctx;
      skeleton.add({
        name: pluginName,
        area: 'topArea',
        type: 'Widget',
        props: {
          align: 'right',
        },
        content: (
          <Button
            onClick={e => {
              e.preventDefault();
              skeleton.showPanel(PluginComponentVersions.pluginName);
            }}
            type="primary"
          >
            发布
          </Button>
        ),
      });
    },
  };
};

PluginComponentRelease.pluginName = pluginName;

export default PluginComponentRelease;
