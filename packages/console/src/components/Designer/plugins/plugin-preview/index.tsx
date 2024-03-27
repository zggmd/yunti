import { IPublicModelPluginContext } from '@alilc/lowcode-types';

import { PREFERENCE_DECLARATION } from '../../utils';
import { PluginPreviewRegisterOptions, PreviewModal } from './components/PreviewModal';

const pluginName = 'LowcodePluginPreview';
export const LowcodePluginPreview = (
  ctx: IPublicModelPluginContext,
  options: PluginPreviewRegisterOptions
) => {
  const { injectPaneProps } = options;
  return {
    // 插件名，注册环境下唯一
    name: pluginName,
    // 依赖的插件（插件名数组）
    dep: [],
    // 插件对外暴露的数据和方法
    exports() {
      return {
        data: '你可以把插件的数据这样对外暴露',
        func: () => {
          // console.log('方法也是一样')
        },
      };
    },
    // 插件的初始化函数，在引擎初始化之后会立刻调用
    async init() {
      const { skeleton } = ctx;

      skeleton.add({
        name: pluginName,
        area: 'topArea',
        type: 'Widget',
        props: {
          align: 'right',
        },
        content: injectPaneProps(PreviewModal),
      });
    },
  };
};

LowcodePluginPreview.pluginName = pluginName;
LowcodePluginPreview.meta = {
  preferenceDeclaration: PREFERENCE_DECLARATION,
};

export default LowcodePluginPreview;
