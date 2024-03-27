import { event, plugins } from '@alilc/lowcode-engine';
import PluginDataSourcePane from '@alilc/lowcode-plugin-datasource-pane';
import Inject from '@alilc/lowcode-plugin-inject';
import ManualPlugin from '@alilc/lowcode-plugin-manual';
import SchemaPlugin from '@alilc/lowcode-plugin-schema';
import PluginUndoRedo from '@alilc/lowcode-plugin-undo-redo';
import { IPublicTypeAssetsJson } from '@alilc/lowcode-types';
import PluginCodeGen from '@yunti/lowcode-plugin-code-generator';

import { DesignerProjectSchema } from '@/components/Designer';
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
import PluginComponentMeta from './plugin-component-meta';
import PluginComponentRelease from './plugin-component-release';
import PluginComponentVersions from './plugin-component-versions';

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
  // 组件元数据
  await plugins.register(PluginComponentMeta, {
    injectPaneProps,
    injectPropsKeys: ['schema'],
  });
  // 模拟器尺寸切换
  await plugins.register(PluginSimulatorConroller);
  // 设计器-画布区域中英文切换
  await plugins.register(PluginChangeLocale);
  // 撤销/重做按钮
  await plugins.register(PluginUndoRedo);
  // 注册出码插件
  await plugins.register(PluginCodeGen, {
    solution: 'father',
    workerJsUrl:
      'http://dev-unpkg.tenxcloud.net/@yunti/lowcode-code-generator@2.4.0/dist/standalone-worker.min.js',
    getAssets,
  });
  // 预览按钮
  await plugins.register(LowcodePluginPreview, {
    injectPaneProps: injectPreviewModalProps,
  });
  // 发布按钮
  await plugins.register(PluginComponentRelease);
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
  await plugins.register(CodeEditor, { type: 'Component' });
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
  // 组件版本管理
  await plugins.register(PluginComponentVersions);
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
  await plugins.register(ManualPlugin);
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
