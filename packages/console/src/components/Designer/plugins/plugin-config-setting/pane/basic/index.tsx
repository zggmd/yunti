import { Radio, Switch } from 'antd';
import { Store } from 'antd/es/form/interface';
import { merge } from 'lodash';
import React, { useMemo } from 'react';

import ColorStringPicker from '../components/ColorStringPicker';
import Setting, { SettingItemProps } from '../components/Setting';
import SliderInput from '../components/SliderInput';
import { DEFAULT_CONFIG } from './constants';

export interface BasicSettingProps {
  initialValues?: Store;
  onChange?: (values: Store) => void;
}

const BasicSetting: React.FC<BasicSettingProps> = ({ initialValues, onChange }) => {
  const newInitialValues = useMemo(() => merge({}, DEFAULT_CONFIG, initialValues), [initialValues]);
  const items: SettingItemProps[] = [
    {
      key: 'basic',
      title: '基础配置',
      description: '这里可以对应用/组件的 antd 等进行配置',
      children: [
        {
          key: 'antd',
          title: 'antd',
          link: 'https://ant.design/',
          description: 'Ant Design 组件相关配置',
          children: [
            {
              key: 'antd-config-provider',
              title: '全局化配置',
              link: 'https://ant.design/components/config-provider-cn',
              description: '为组件提供统一的全局化配置',
              children: [
                {
                  key: 'antd-config-provider-componentSize',
                  title: '组件大小',
                  formItem: {
                    name: ['antd', 'configProvider', 'componentSize'],
                    children: (
                      <Radio.Group
                        optionType="button"
                        options={[
                          {
                            label: '小',
                            value: 'small',
                          },
                          {
                            label: '中',
                            value: 'middle',
                          },
                          {
                            label: '大',
                            value: 'large',
                          },
                        ]}
                      />
                    ),
                  },
                },
                {
                  key: 'antd-config-provider-autoInsertSpaceInButton',
                  title: '关闭时，移除按钮中 2 个汉字之间的空格',
                  formItem: {
                    name: ['antd', 'configProvider', 'autoInsertSpaceInButton'],
                    valuePropName: 'checked',
                    children: <Switch checkedChildren="开" defaultChecked unCheckedChildren="关" />,
                  },
                },
                {
                  key: 'antd-config-provider-componentDisabled',
                  title: '全局组件禁用',
                  formItem: {
                    name: ['antd', 'configProvider', 'componentDisabled'],
                    valuePropName: 'checked',
                    children: <Switch checkedChildren="开" unCheckedChildren="关" />,
                  },
                },
                {
                  key: 'antd-config-provider-popupMatchSelectWidth',
                  title: '下拉菜单和选择器同宽',
                  formItem: {
                    name: ['antd', 'configProvider', 'popupMatchSelectWidth'],
                    valuePropName: 'checked',
                    children: <Switch checkedChildren="开" unCheckedChildren="关" />,
                  },
                },
                {
                  key: 'antd-config-provider-virtual',
                  title: '虚拟滚动',
                  formItem: {
                    name: ['antd', 'configProvider', 'virtual'],
                    valuePropName: 'checked',
                    children: <Switch checkedChildren="开" defaultChecked unCheckedChildren="关" />,
                  },
                },
                {
                  key: 'antd-config-provider-theme',
                  title: '定制主题',
                  link: 'https://ant.design/docs/react/customize-theme-cn',
                  description:
                    'Ant Design 设计规范和技术上支持灵活的样式定制，以满足业务和品牌上多样化的视觉需求，包括但不限于全局样式（主色、圆角、边框）和指定组件的视觉定制。',
                  children: [
                    {
                      key: 'antd-config-provider-theme-colorPrimary',
                      title: '主题色',
                      formItem: {
                        name: ['antd', 'configProvider', 'theme', 'token', 'colorPrimary'],
                        children: <ColorStringPicker disabledAlpha format="hex" showText />,
                      },
                    },
                    {
                      key: 'antd-config-provider-theme-colorLink',
                      title: '链接颜色',
                      formItem: {
                        name: ['antd', 'configProvider', 'theme', 'token', 'colorLink'],
                        children: <ColorStringPicker disabledAlpha format="hex" showText />,
                      },
                    },
                    {
                      key: 'antd-config-provider-theme-colorLinkHover',
                      title: '链接 Hover 颜色',
                      formItem: {
                        name: ['antd', 'configProvider', 'theme', 'token', 'colorLinkHover'],
                        children: <ColorStringPicker disabledAlpha format="hex" showText />,
                      },
                    },
                    {
                      key: 'antd-config-provider-theme-fontSize',
                      title: '文字大小',
                      formItem: {
                        name: ['antd', 'configProvider', 'theme', 'token', 'fontSize'],
                        children: <SliderInput addonAfter="px" max={32} min={12} />,
                      },
                    },
                    {
                      key: 'antd-config-provider-theme-borderRadius',
                      title: '圆角大小',
                      formItem: {
                        name: ['antd', 'configProvider', 'theme', 'token', 'borderRadius'],
                        children: <SliderInput addonAfter="px" max={16} min={0} />,
                      },
                    },
                    {
                      key: 'antd-config-provider-theme-rowVerticalGutter',
                      title: '栅格行组件（Row）垂直间距',
                      formItem: {
                        name: [
                          'antd',
                          'configProvider',
                          'theme',
                          'components',
                          'Row',
                          'rowVerticalGutter',
                        ],
                        children: <SliderInput addonAfter="px" min={0} />,
                      },
                    },
                    {
                      key: 'antd-config-provider-theme-rowHorizontalGutter',
                      title: '栅格行组件（Row）水平间距',
                      formItem: {
                        name: [
                          'antd',
                          'configProvider',
                          'theme',
                          'components',
                          'Row',
                          'rowHorizontalGutter',
                        ],
                        children: <SliderInput addonAfter="px" min={0} />,
                      },
                    },
                    {
                      key: 'antd-config-provider-theme-pageBackground',
                      title: '页面背景',
                      formItem: {
                        name: [
                          'antd',
                          'configProvider',
                          'theme',
                          'components',
                          'Page',
                          'pageBackground',
                        ],
                        children: <ColorStringPicker disabledAlpha format="hex" showText />,
                      },
                    },
                    {
                      key: 'antd-config-provider-theme-pagePadding',
                      title: '页面边距',
                      formItem: {
                        name: [
                          'antd',
                          'configProvider',
                          'theme',
                          'components',
                          'Page',
                          'pagePadding',
                        ],
                        children: <SliderInput addonAfter="px" min={0} />,
                      },
                    },
                    {
                      key: 'antd-config-provider-theme-pagePaddingTop',
                      title: '页面上边距',
                      formItem: {
                        name: [
                          'antd',
                          'configProvider',
                          'theme',
                          'components',
                          'Page',
                          'pagePaddingTop',
                        ],
                        children: <SliderInput addonAfter="px" min={0} />,
                      },
                    },
                    {
                      key: 'antd-config-provider-theme-pagePaddingBottom',
                      title: '页面下边距',
                      formItem: {
                        name: [
                          'antd',
                          'configProvider',
                          'theme',
                          'components',
                          'Page',
                          'pagePaddingBottom',
                        ],
                        children: <SliderInput addonAfter="px" min={0} />,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ];
  return <Setting initialValues={newInitialValues} items={items} onChange={onChange} />;
};

export default BasicSetting;
