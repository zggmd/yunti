/**
 * 数据源插件
 *
 * https://github.com/alibaba/lowcode-plugins/blob/main/packages/plugin-datasource-pane/src/index.tsx
 * 主要是增加了 title
 *
 */
import DataSourcePanePlugin from '@alilc/lowcode-plugin-datasource-pane/lib/pane';
import {
  DataSourcePaneImportPlugin,
  DataSourceType,
} from '@alilc/lowcode-plugin-datasource-pane/lib/types';
import { IPublicModelPluginContext } from '@alilc/lowcode-types';

export interface Options {
  importPlugins?: DataSourcePaneImportPlugin[];
  dataSourceTypes: DataSourceType[];
  exportPlugins?: DataSourcePaneImportPlugin[];
}

// TODO: 2.0插件传参修改，不支持直接options: Options
const PluginDataSourcePane = (ctx: IPublicModelPluginContext, options: Options) => {
  return {
    name: 'com.alibaba.lowcode.datasource.pane',
    width: 300,
    // 依赖的插件（插件名数组）
    dep: [],
    // 插件对外暴露的数据和方法
    exports() {
      return {};
    },
    // 插件的初始化函数，在引擎初始化之后会立刻调用
    async init() {
      const dataSourceTypes =
        ctx.preference.getPreferenceValue('dataSourceTypes') || options.dataSourceTypes;
      const importPlugins =
        ctx.preference.getPreferenceValue('importPlugins') || options.importPlugins;
      const schemaDock = ctx.skeleton.add({
        area: 'leftArea',
        name: 'dataSourcePane',
        type: 'PanelDock',
        props: {
          icon: 'shujuyuan',
          title: '数据源',
        },
        panelProps: {
          width: '300px',
          // title: '源码面板',
        },
        content: DataSourcePanePlugin,
        contentProps: {
          importPlugins,
          dataSourceTypes,
          event: ctx.event,
          project: ctx.project,
          logger: ctx.logger,
          setters: ctx.setters,
        },
      });

      schemaDock && schemaDock.disable();
      ctx.project.onSimulatorRendererReady(() => {
        schemaDock.enable();
      });
    },
  };
};

PluginDataSourcePane.pluginName = 'DataSourcePane';
PluginDataSourcePane.meta = {
  preferenceDeclaration: {
    title: '数据源面板插件参数定义',
    properties: [
      {
        key: 'importPlugins',
        type: 'array',
        description: '',
      },
      {
        key: 'dataSourceTypes',
        type: 'array',
        description: '数据源类型',
      },
    ],
  },
};

export default PluginDataSourcePane;
