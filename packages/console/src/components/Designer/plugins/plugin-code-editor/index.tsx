import { project } from '@alilc/lowcode-engine';
import icon from '@alilc/lowcode-plugin-code-editor/es/icon';
import { IPublicModelPluginContext } from '@alilc/lowcode-types';

import { CodeEditorPane } from './pane/index';

export const CodeEditor = (
  ctx: IPublicModelPluginContext,
  options?: { type: 'Page' | 'Component' }
) => {
  const { type } = options || {};
  return {
    name: 'codeEditor',
    width: 600,
    // 依赖的插件（插件名数组）
    dep: [],
    // 插件对外暴露的数据和方法
    exports() {
      return {};
    },
    // 插件的初始化函数，在引擎初始化之后会立刻调用
    async init() {
      const codeEditorDock = ctx.skeleton.add({
        area: 'leftArea',
        name: 'codeEditor',
        type: 'PanelDock',
        props: {
          icon,
          title: '源码',
        },
        panelProps: {
          width: '600px',
          title: '源码面板',
        },
        content: (
          <CodeEditorPane
            event={ctx.event}
            project={ctx.project}
            skeleton={ctx.skeleton}
            type={type}
          />
        ),
      });

      codeEditorDock && codeEditorDock.disable();
      project.onSimulatorRendererReady(() => {
        codeEditorDock.enable();
      });
    },
  };
};

CodeEditor.pluginName = 'codeEditor';
CodeEditor.meta = {
  preferenceDeclaration: {
    title: '插件配置',
    properties: [
      {
        key: 'type',
        type: 'string',
        description: '类型：页面 (Page) 或者组件 (Component)',
      },
    ],
  },
};

export default CodeEditor;
