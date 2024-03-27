import AliLowCodeEngineExt from '@alilc/lowcode-engine-ext';
import { IPublicModelPluginContext } from '@alilc/lowcode-types';

import I18nSetter from '../../setters/I18nSetter';
import { PluginRegisterOptions } from '../../type';
import { PREFERENCE_DECLARATION } from '../../utils';
import { VariableBindDialog } from '../plugin-variable-bind-dialog';

// 设置内置 setter 和事件绑定、插件绑定面板
export const DefaultSettersRegistryPlugin = (
  ctx: IPublicModelPluginContext,
  options: PluginRegisterOptions
) => {
  return {
    async init() {
      const { injectPaneProps, injectPropsKeys } = options;
      const { setterMap, pluginMap } = AliLowCodeEngineExt;
      const { setters, skeleton } = ctx;
      // 注册 setterMap
      const formatSetter = (key, title) => {
        if (setterMap?.[key]?.component) {
          return {
            ...setterMap?.[key],
            title,
          };
        }
        return {
          component: setterMap?.[key],
          title,
        };
      };
      const newSetterMap = Object.assign({}, setterMap, {
        I18nSetter: {
          component: injectPaneProps(I18nSetter, injectPropsKeys),
          defaultProps: {},
          title: '多语言文案',
        },
        StringSetter: formatSetter('StringSetter', '文本输入'),
        NumberSetter: formatSetter('NumberSetter', '数字输入'),
        RadioGroupSetter: formatSetter('RadioGroupSetter', '按钮选择'),
        ColorSetter: formatSetter('ColorSetter', '颜色选择'),
        BoolSetter: formatSetter('BoolSetter', '布尔型设置'),
        SelectSetter: formatSetter('SelectSetter', '下拉选择'),
        TextAreaSetter: formatSetter('TextAreaSetter', '多行文本输入'),
        DateSetter: formatSetter('DateSetter', '日期选择'),
        TimePicker: formatSetter('TimePicker', '时间选择'),
        DateYearSetter: formatSetter('DateYearSetter', '年选择'),
        DateMonthSetter: formatSetter('DateMonthSetter', '月选择'),
        DateRangeSetter: formatSetter('DateRangeSetter', '日期范围选择'),
        EventsSetter: formatSetter('EventsSetter', '事件绑定'),
        JsonSetter: formatSetter('JsonSetter', 'Json 数据输入'),
        StyleSetter: formatSetter('StyleSetter', '样式设置'),
        ClassNameSetter: formatSetter('ClassNameSetter', '类名绑定'),
        MixedSetter: formatSetter('MixedSetter', '混合型数据设置'),
        SlotSetter: formatSetter('SlotSetter', '节点输入'),
        ArraySetter: formatSetter('ArraySetter', '数组输入'),
        ObjectSetter: formatSetter('ObjectSetter', '对象输入'),
      });
      setters.registerSetter(newSetterMap);
      // 注册插件
      // 注册事件绑定面板
      skeleton.add({
        area: 'centerArea',
        type: 'Widget',
        content: pluginMap.EventBindDialog,
        name: 'eventBindDialog',
        props: {},
      });

      // 注册变量绑定面板
      skeleton.add({
        area: 'centerArea',
        type: 'Widget',
        content: VariableBindDialog,
        name: 'variableBindDialog',
        props: {},
      });
    },
  };
};
DefaultSettersRegistryPlugin.pluginName = 'DefaultSettersRegistryPlugin';
DefaultSettersRegistryPlugin.meta = {
  preferenceDeclaration: PREFERENCE_DECLARATION,
};

export default DefaultSettersRegistryPlugin;
