import { IPublicModelPluginContext } from '@alilc/lowcode-types';
import { ToolOutlined } from '@ant-design/icons';

import { PluginRegisterOptions } from '../../type';
import { PREFERENCE_DECLARATION } from '../../utils';
import { pluginName } from './helper';
import Pane from './pane';

export * from './helper';
const pluginTitle = '全局上下文管理';
export const PluginConfigAppHelper = (
  ctx: IPublicModelPluginContext,
  options: PluginRegisterOptions
) => {
  const { injectPaneProps, injectPropsKeys } = options;
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
          icon: <ToolOutlined className="icon" style={{ fontSize: '18px' }} />,
          description: pluginTitle,
          align: 'bottom',
        },
        panelProps: {
          width: '600px',
          title: pluginTitle,
        },
        contentProps: {},
        content: injectPaneProps(Pane, injectPropsKeys),
      });
    },
  };
};

PluginConfigAppHelper.pluginName = pluginName;
PluginConfigAppHelper.pluginTitle = pluginTitle;
PluginConfigAppHelper.meta = {
  preferenceDeclaration: PREFERENCE_DECLARATION,
};

export default PluginConfigAppHelper;
