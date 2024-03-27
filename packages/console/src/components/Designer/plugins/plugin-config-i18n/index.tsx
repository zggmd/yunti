import { IPublicModelPluginContext } from '@alilc/lowcode-types';
import { GlobalOutlined } from '@ant-design/icons';

import { PluginRegisterOptions } from '../../type';
import { PREFERENCE_DECLARATION } from '../../utils';
import Pane from './pane';

const pluginName = 'PluginConfigI18n';
const pluginTitle = '多语言文案管理';
export const PluginConfigI18n = (
  ctx: IPublicModelPluginContext,
  options: PluginRegisterOptions
) => {
  const { injectPaneProps, injectPropsKeys } = options;
  return {
    name: pluginName,
    width: 780,
    dep: [],
    // 插件的初始化函数，在引擎初始化之后会立即调用
    async init() {
      ctx.skeleton.add({
        area: 'leftArea',
        name: pluginName,
        type: 'PanelDock',
        props: {
          icon: <GlobalOutlined className="icon" style={{ fontSize: '18px' }} />,
          description: pluginTitle,
          align: 'bottom',
        },
        panelProps: {
          width: '780px',
          title: pluginTitle,
        },
        contentProps: {
          project: ctx.project,
        },
        content: injectPaneProps(Pane, injectPropsKeys),
      });
    },
  };
};

PluginConfigI18n.pluginName = pluginName;
PluginConfigI18n.pluginTitle = pluginTitle;
PluginConfigI18n.meta = {
  preferenceDeclaration: PREFERENCE_DECLARATION,
};

export default PluginConfigI18n;
