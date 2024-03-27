import { Store } from 'antd/es/form/interface';
import React from 'react';

import Setting, { SettingItemProps } from '../components/Setting';

export interface OthersSettingProps {
  initialValues: Store;
  onChange?: (values: Store) => void;
}

const OthersSetting: React.FC<OthersSettingProps> = ({ initialValues, onChange }) => {
  const items: SettingItemProps[] = [
    {
      key: 'others',
      title: '其他设置',
      link: 'https://lowcode-engine.cn/site/docs/specs/lowcode-spec',
      description: '这里可以对应用/组件中除 antd、国际化、常量、工具函数外的其他配置进行设置',
      children: [
        //
      ],
    },
  ];

  return <Setting initialValues={initialValues} items={items} onChange={onChange} />;
};

export default OthersSetting;
