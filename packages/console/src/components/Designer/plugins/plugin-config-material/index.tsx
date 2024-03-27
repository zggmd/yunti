import { IPublicModelPluginContext } from '@alilc/lowcode-types';
import { BuildOutlined } from '@ant-design/icons';

import { PluginRegisterOptions } from '../../type';
import { PREFERENCE_DECLARATION } from '../../utils';
import ConfigMaterial from './pane';

const pluginName = 'PluginConfigMaterial';
const pluginTitle = '资产配置';
export const PluginConfigMaterial = (
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
          icon: <BuildOutlined className="icon" style={{ fontSize: '18px' }} />,
          description: pluginTitle,
          align: 'bottom',
        },
        panelProps: {
          width: '860px',
          title: pluginTitle,
        },
        content: injectPaneProps(ConfigMaterial, injectPropsKeys),
      });
    },
  };
};

PluginConfigMaterial.pluginName = pluginName;
PluginConfigMaterial.pluginTitle = pluginTitle;
PluginConfigMaterial.meta = {
  preferenceDeclaration: PREFERENCE_DECLARATION,
};

export default PluginConfigMaterial;
