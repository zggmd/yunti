import { IPublicModelPluginContext } from '@alilc/lowcode-types';
import { SettingOutlined } from '@ant-design/icons';

import { PluginRegisterOptions } from '../../type';
import { PREFERENCE_DECLARATION } from '../../utils';
import ConfigSetting from './pane';

const pluginName = 'PluginConfigSetting';
const pluginTitle = '全局设置';
export const PluginConfigSetting = (
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
        area: 'leftArea',
        name: pluginName,
        type: 'PanelDock',
        props: {
          icon: <SettingOutlined className="icon" style={{ fontSize: '18px' }} />,
          description: pluginTitle,
          align: 'bottom',
        },
        panelProps: {
          width: '860px',
          title: pluginTitle,
        },
        content: injectPaneProps(ConfigSetting, injectPropsKeys),
      });
    },
  };
};

PluginConfigSetting.pluginName = pluginName;
PluginConfigSetting.pluginTitle = pluginTitle;
PluginConfigSetting.meta = {
  preferenceDeclaration: PREFERENCE_DECLARATION,
};

export default PluginConfigSetting;
