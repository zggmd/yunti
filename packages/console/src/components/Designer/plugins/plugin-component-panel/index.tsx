import { IPublicModelPluginContext } from '@alilc/lowcode-types';

import ComponentsPane from './pane';

export const PluginComponentPanel = (ctx: IPublicModelPluginContext) => {
  return {
    async init() {
      const { skeleton, project } = ctx;
      const name = 'componentsPane';
      // 注册组件面板
      const componentsPane = skeleton.add({
        area: 'leftArea',
        type: 'PanelDock',
        name,
        content: ComponentsPane,
        contentProps: {},
        props: {
          align: 'top',
          icon: 'zujianku',
          title: '组件库',
        },
        panelProps: {
          area: 'leftFixedArea',
        },
      });
      // 默认展示组件库面板
      skeleton.showPanel(name);
      componentsPane?.disable?.();
      project.onSimulatorRendererReady(() => {
        componentsPane?.enable?.();
      });
    },
  };
};
PluginComponentPanel.pluginName = 'PluginComponentPanel';
export default PluginComponentPanel;
