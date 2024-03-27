import { event, plugins } from '@alilc/lowcode-engine';
// import DataSourcePanePlugin from '@alilc/lowcode-plugin-datasource-pane';
import Inject from '@alilc/lowcode-plugin-inject';
import SchemaPlugin from '@alilc/lowcode-plugin-schema';
import PluginUndoRedo from '@alilc/lowcode-plugin-undo-redo';
import { IPublicTypeAssetsJson } from '@alilc/lowcode-types';
import PluginCodeGen from '@yunti/lowcode-plugin-code-generator';

import { DesignerProjectSchema } from '@/components/Designer';
import PluginDataSourcePane from '@/components/Designer/plugins/plugin-datasource-pane';
// import ManualPlugin from '@alilc/lowcode-plugin-manual';
import SetRefPropPlugin from '@/components/Designer/plugins/plugin-set-ref-prop';

import {
  CodeEditor,
  DefaultSettersRegistryPlugin,
  LowcodePluginPreview,
  PluginBlockPanel,
  PluginChangeLocale,
  PluginComponentPanel,
  PluginConfigAppHelper,
  PluginConfigI18n,
  PluginConfigMaterial,
  PluginConfigSetting,
  PluginEditorInit,
  PluginGitCommit,
  PluginSave,
  PluginSimulatorConroller,
  addSaveBlock,
} from '../../../components/Designer/plugins';
import {
  getAssets,
  injectGitCommitPaneProps,
  injectPaneProps,
  injectPreviewModalProps,
  saveSchema,
} from '../utils';
import PluginPageSwitcher from './plugin-page-switcher';

// 用于导航右上角设计器菜单展示
export const LAYOUT_ACTIONS = [
  {
    name: PluginConfigSetting.pluginName,
    titile: PluginConfigSetting.pluginTitle,
  },
  {
    name: PluginConfigAppHelper.pluginName,
    titile: PluginConfigAppHelper.pluginTitle,
  },
  {
    name: PluginConfigMaterial.pluginName,
    titile: PluginConfigMaterial.pluginTitle,
  },
  {
    name: PluginConfigI18n.pluginName,
    titile: PluginConfigI18n.pluginTitle,
  },
  {
    name: PluginGitCommit.pluginName,
    titile: PluginGitCommit.pluginTitle,
  },
  {
    name: SchemaPlugin.pluginName,
    titile: 'Schema',
  },
];

export default async function registerPlugins({
  schema,
  assets,
}: {
  schema: DesignerProjectSchema;
  assets: IPublicTypeAssetsJson;
}) {
  // 低代码引擎生态元素项目内调试用插件，要在 editor init 前注册
  await plugins.register(Inject);
  // 初始化编辑器
  await plugins.register(PluginEditorInit, { schema, assets });

  /** --- ↓↓↓↓↓↓ 编辑器顶部区域定制 ↓↓↓↓↓↓ --- */
  // 大纲树
  // await plugins.delete(OutlinePlugin.name);
  // await plugins.register(OutlinePlugin, {}, { autoInit: true, override: true });
  // 页面切换
  await plugins.register(PluginPageSwitcher);
  // 模拟器尺寸切换
  await plugins.register(PluginSimulatorConroller);
  // 设计器-画布区域中英文切换
  await plugins.register(PluginChangeLocale);
  // 撤销/重做按钮
  await plugins.register(PluginUndoRedo);
  // 注册出码插件
  await plugins.register(PluginCodeGen, {
    solution: 'umi',
    workerJsUrl:
      'http://dev-unpkg.tenxcloud.net/@yunti/lowcode-code-generator@2.4.0/dist/standalone-worker.min.js',
    getAssets,
  });
  // 预览按钮
  await plugins.register(LowcodePluginPreview, {
    injectPaneProps: injectPreviewModalProps,
  });
  // 保存按钮
  await plugins.register(PluginSave);
  event.on('common:save', () => {
    saveSchema();
  });
  /** ---------------------------------------- */

  /** --- ↓↓↓↓↓↓ 编辑器侧边栏区域定制 ↓↓↓↓↓↓ --- */
  // 组件面板
  await plugins.register(PluginComponentPanel);
  // 添加保存区块，区块面板
  addSaveBlock();
  await plugins.register(PluginBlockPanel);
  // 源码编辑面板
  await plugins.register(CodeEditor, { type: 'Page' });
  // 数据源面板
  // 插件参数声明 & 传递，参考：https://lowcode-engine.cn/site/docs/api/plugins#设置插件参数版本示例
  await plugins.register(PluginDataSourcePane, {
    importPlugins: [],
    dataSourceTypes: [
      {
        type: 'axios',
      },
      {
        type: 'jsonp',
      },
    ],
  });
  // 支持查看低代码引擎 schema
  await plugins.register(SchemaPlugin, {
    isProjectSchema: true,
  });
  // Git 提交面板
  await plugins.register(PluginGitCommit, {
    injectPaneProps: injectGitCommitPaneProps,
  });
  // 全局上下文管理（constants, utils）
  await plugins.register(PluginConfigAppHelper, {
    injectPaneProps,
    injectPropsKeys: ['schema', 'assets', 'onSchemaSave'],
  });
  //  多语言文案配置
  await plugins.register(PluginConfigI18n, {
    injectPaneProps,
    injectPropsKeys: ['schema', 'i18nUsage', 'onI18nSave'],
  });
  // 资产配置
  await plugins.register(PluginConfigMaterial, {
    injectPaneProps,
    injectPropsKeys: ['assets', 'onAssetsSave'],
  });
  //  全局配置
  await plugins.register(PluginConfigSetting, {
    injectPaneProps,
    injectPropsKeys: ['schema', 'assets', 'onSchemaAndAssetsSave'],
  });
  // 低代码产品使用手册
  // await plugins.register(ManualPlugin);
  /** ---------------------------------------- */

  /** --- ↓↓↓↓↓↓ 编辑器设置器定制 ↓↓↓↓↓↓ --- */
  // 设置内置 setter 和事件绑定、插件绑定面板
  await plugins.register(DefaultSettersRegistryPlugin, {
    injectPaneProps,
    injectPropsKeys: ['schema', 'onI18nSave'],
  });

  // 提供在高级设置面板中设置 ref-id 的能力
  await plugins.register(SetRefPropPlugin);
  /** ---------------------------------------- */
}
