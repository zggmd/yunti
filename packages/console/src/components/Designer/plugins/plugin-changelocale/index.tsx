import { config, project } from '@alilc/lowcode-engine';
import { IPublicModelPluginContext } from '@alilc/lowcode-types';
import { DownOutlined } from '@ant-design/icons';
import { Dropdown } from 'antd';
import * as React from 'react';

const LANG_MAP = [
  {
    key: 'zh-CN',
    label: '简体中文',
  },
  {
    key: 'en-US',
    label: 'English',
  },
];

const ChangeLocale = () => {
  const defaultKey = LANG_MAP[0].key;
  const [locale, setLocale] = React.useState(defaultKey);

  const changeLocal = (changeToLocale: string) => {
    project.simulatorHost.set('locale', changeToLocale);
    project.simulator.rerender();
    config.set('locale', changeToLocale);
    setLocale(changeToLocale);
  };

  return (
    <Dropdown menu={{ items: LANG_MAP, onClick: ({ key }) => changeLocal(key) }}>
      <span style={{ lineHeight: '32px', marginLeft: '20px' }}>
        {LANG_MAP.find(item => item.key === locale)?.label}
        <DownOutlined style={{ marginLeft: '8px' }} />
      </span>
    </Dropdown>
  );
};

const pluginName = 'PluginChangeLocale';
export const PluginChangeLocale = (ctx: IPublicModelPluginContext) => {
  return {
    // 插件名，注册环境下唯一
    name: pluginName,
    // 依赖的插件（插件名数组）
    dep: [],
    // 插件对外暴露的数据和方法
    exports() {
      return {
        data: '',
        func: () => {},
      };
    },
    // 插件的初始化函数，在引擎初始化之后会立刻调用
    async init() {
      ctx.skeleton.add({
        name: pluginName,
        area: 'topArea',
        type: 'Widget',
        props: {
          align: 'center',
        },
        content: <ChangeLocale />,
      });
    },
  };
};

PluginChangeLocale.pluginName = pluginName;

export default PluginChangeLocale;
