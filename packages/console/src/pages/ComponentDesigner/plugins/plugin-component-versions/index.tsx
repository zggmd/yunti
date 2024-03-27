import { IPublicModelPluginContext } from '@alilc/lowcode-types';
import { TagsOutlined } from '@ant-design/icons';

import Pane from './pane';

const pluginName = 'PluginComponentVersions';
export const PluginComponentVersions = (ctx: IPublicModelPluginContext) => {
  return {
    name: pluginName,
    width: 600,
    dep: [],
    // 插件的初始化函数，在引擎初始化之后会立即调用
    async init() {
      ctx.skeleton.add({
        area: 'leftArea',
        name: pluginName,
        type: 'PanelDock',
        props: {
          icon: <TagsOutlined className="icon" style={{ fontSize: '18px' }} />,
          description: '组件版本管理',
          align: 'bottom',
        },
        panelProps: {
          width: '600px',
          title: '组件版本管理',
        },
        contentProps: {},
        content: Pane,
      });
    },
  };
};

PluginComponentVersions.pluginName = pluginName;

export default PluginComponentVersions;
