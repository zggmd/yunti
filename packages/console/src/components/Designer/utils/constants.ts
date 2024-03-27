/**
 * 用于声明插件的参数
 * https://lowcode-engine.cn/site/docs/api/plugins
 */
export const PREFERENCE_DECLARATION = Object.freeze({
  title: '插件配置',
  properties: [
    {
      key: 'injectPaneProps',
      type: 'function',
      description: '为 pane 注入属性的函数',
    },
    {
      key: 'injectPropsKeys',
      type: 'array',
      description: '注入属性的 key 列表',
    },
  ],
});
