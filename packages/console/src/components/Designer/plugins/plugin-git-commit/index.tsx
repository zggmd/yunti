import { IPublicModelPluginContext } from '@alilc/lowcode-types';
import { BranchesOutlined } from '@ant-design/icons';

import { PREFERENCE_DECLARATION } from '../../utils';
import { GitCommitPane, PluginGitCommitRegisterOptions } from './pane';

export * from './pane';

const pluginName = 'PluginGitCommit';
const pluginTitle = 'Git 提交面板';
export const PluginGitCommit = (
  ctx: IPublicModelPluginContext,
  options: PluginGitCommitRegisterOptions
) => {
  const { injectPaneProps } = options;
  return {
    // 插件名，注册环境下唯一
    name: pluginName,
    // 依赖的插件（插件名数组）
    dep: [],
    // 插件的初始化函数，在引擎初始化之后会立刻调用
    async init() {
      // 其他插件暴露的方法和属性
      // const { data, func } = ctx.plugins.pluginA;
      // 往引擎增加面板
      ctx.skeleton.add({
        area: 'leftArea',
        name: pluginName,
        type: 'PanelDock',
        props: {
          icon: <BranchesOutlined className="icon" style={{ fontSize: '20px' }} />,
          description: pluginTitle,
          align: 'bottom',
        },
        content: injectPaneProps(GitCommitPane),
      });
    },
  };
};
PluginGitCommit.pluginName = pluginName;
PluginGitCommit.pluginTitle = pluginTitle;
PluginGitCommit.meta = {
  preferenceDeclaration: PREFERENCE_DECLARATION,
};

export default PluginGitCommit;
