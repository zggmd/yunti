import { injectAssets } from '@alilc/lowcode-plugin-inject';
import {
  IPublicModelPluginContext,
  IPublicTypeAssetsJson,
  IPublicTypeProjectSchema,
} from '@alilc/lowcode-types';
import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';

import defaultAssets from '../../services/assets.json';
import { DesignerProjectSchema } from '../../type';
import './index.less';

interface PluginEditorInitRegisterOptions {
  schema: DesignerProjectSchema;
  assets: IPublicTypeAssetsJson;
}

const pluginName = 'PluginEditorInit';
export const PluginEditorInit = (
  ctx: IPublicModelPluginContext,
  options: PluginEditorInitRegisterOptions
) => {
  return {
    name: pluginName,
    async init() {
      const { material, project } = ctx;
      const schema: DesignerProjectSchema = cloneDeep(options?.schema);
      const assets = cloneDeep(isEmpty(options.assets) ? defaultAssets : options.assets);
      // 以支持调试的方式注册资产包，这样启动并部署出来的项目，可以通过在预览地址加上 ?debug 来调试本地物料？
      await material.setAssets(await injectAssets(assets));
      project.importSchema(schema as unknown as IPublicTypeProjectSchema);
      // 加载中英文
      project.setI18n(schema?.i18n);
      // 页面刷新确认提醒
      window.onbeforeunload = () => '系统可能不会保存您所做的更改。';
    },
  };
};
PluginEditorInit.pluginName = pluginName;
PluginEditorInit.meta = {
  preferenceDeclaration: {
    title: '插件配置',
    properties: [
      {
        key: 'schema',
        type: 'object',
        description: 'project schema 数据',
      },
      {
        key: 'assets',
        type: 'object',
        description: '资产数据',
      },
    ],
  },
};

export default PluginEditorInit;
