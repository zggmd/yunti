import { Input } from 'antd';
import { Store } from 'antd/es/form/interface';
import React, { useMemo } from 'react';

import Setting, { SettingItemProps } from '../components/Setting';

export interface MetaSettingProps {
  initialValues: Store;
  onChange?: (values: Store) => void;
}

const DISABLED_KEYS = new Set(['name', 'basename', 'namespace', 'description']);

const MetaSetting: React.FC<MetaSettingProps> = ({ initialValues, onChange }) => {
  const items = useMemo<SettingItemProps[]>(
    () => [
      {
        key: 'meta',
        title: '元数据设置',
        link: 'https://lowcode-engine.cn/site/docs/specs/lowcode-spec#29-%E5%BD%93%E5%89%8D%E5%BA%94%E7%94%A8%E5%85%83%E6%95%B0%E6%8D%AE%E4%BF%A1%E6%81%AFaa',
        description:
          '应用/组件的元数据信息，比如当前应用的名称、Git 信息、版本号等等，该字段为扩展字段，消费方式由各自场景自己决定。',
        children: Object.keys(initialValues).map(key => ({
          key,
          title: key,
          formItem: {
            name: key,
            children: <Input disabled={DISABLED_KEYS.has(key)} style={{ width: '60%' }} />,
          },
        })),
      },
    ],
    [initialValues]
  );

  return <Setting initialValues={initialValues} items={items} onChange={onChange} />;
};

export default MetaSetting;
