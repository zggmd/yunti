import { material, project } from '@alilc/lowcode-engine';
import {
  IPublicEnumTransformStage,
  IPublicTypeRemoteComponentDescription,
} from '@alilc/lowcode-types';
import { CheckOutlined, LoadingOutlined } from '@ant-design/icons';
import { Space, Tabs, Typography } from 'antd';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { LowCodePackage, PaneInjectProps } from '../../../type';
import ComponentsManangement from './components-management';
import styles from './index.less';
import OthersConfig from './others-config';
import PackagesManangement from './packages-management';

const { Text } = Typography;

const ConfigSetting: React.FC<PaneInjectProps> = props => {
  const { id, tree, assets, onAssetsSave } = props;
  const [saving, setSaving] = useState<boolean | undefined>();
  const setSavingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => clearTimeout(setSavingTimeoutRef.current);
  }, []);

  const othersConfig = useMemo(
    () =>
      Object.assign({}, assets, {
        components: undefined,
        packages: undefined,
      }),
    [assets]
  );

  const onSave = useCallback(
    async (partAsset: Record<string, any>) => {
      clearTimeout(setSavingTimeoutRef.current);
      setSaving(true);
      const newAssets = Object.assign({}, assets, partAsset);
      // packages 中不保存低码组件，低码组件只在 components 中保存，使用时会动态插入到 packages 中
      newAssets.packages = newAssets.packages?.filter(pkg => {
        // 不保存 pkgDependents 字段
        delete (pkg as any).pkgDependents;
        return (pkg as unknown as LowCodePackage).type !== 'lowCode';
      });
      newAssets.components = newAssets.components?.map(component => {
        const { componentName, devMode, reference, title, version, pkgDependents } = component;
        // 低码组件中只保留 componentName, devMode, reference, title, version 这几个字段
        if (devMode === 'lowCode') {
          return { componentName, devMode, reference, title, version, pkgDependents };
        }
        return component;
      });

      // npm 包中如果有 meta 声明，则自动将 npm 包引入到组件中（仅编辑 npm 包时执行这个逻辑）
      if (partAsset.packages) {
        if (!newAssets.components) {
          newAssets.components = [];
        }
        for (const pkg of newAssets.packages as unknown as LowCodePackage[]) {
          if (pkg.meta?.url) {
            const targetComponentIndex = newAssets.components.findIndex(
              c => c.reference?.id === pkg.package
            );
            if (targetComponentIndex > -1) {
              newAssets.components[targetComponentIndex].version = pkg.version;
              newAssets.components[targetComponentIndex].exportName = pkg.meta.exportName;
              newAssets.components[targetComponentIndex].url = pkg.meta.url;
              newAssets.components[targetComponentIndex].reference.version = pkg.version;
            } else {
              newAssets.components.push({
                devMode: 'proCode',
                exportName: pkg.meta.exportName || (pkg.library && `${pkg.library}Meta`),
                version: pkg.version || 'latest',
                url: pkg.meta?.url,
                reference: {
                  id: pkg.package,
                  version: pkg.version,
                },
              } as unknown as IPublicTypeRemoteComponentDescription);
            }
          }
        }
      }
      // 保存 schema
      const res = await onAssetsSave(newAssets);
      setSaving(false);
      // eslint-disable-next-line unicorn/no-useless-undefined
      setSavingTimeoutRef.current = setTimeout(() => setSaving(undefined), 1000);
      // 将新的 assets 导入到设计器中
      // 这个方法只会加载 components 中定义的 meta 资源，不会重新加载 package 资源，需要单独处理
      await material.setAssets(res?.assets);

      // 导入 componentsMap 和 utils (包版本更新需要同步更新 componentsMap 和 utils 中的引用)
      const projectSchema = project.exportSchema(IPublicEnumTransformStage.Save);
      projectSchema.componentsMap = res?.schema.componentsMap;
      projectSchema.utils = res?.schema.utils;
      project.importSchema(projectSchema);

      // 刷新模拟器，模拟器中已存在的低码组件不会被更新，需要刷新整个页面
      project.simulatorHost.rerender();
    },
    [assets, onAssetsSave]
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onSaveDebounce = useCallback(debounce(onSave, 500), [onSave]);

  const SavingContent = useMemo(() => {
    if (saving === undefined) {
      return null;
    }
    if (saving === true) {
      return (
        <Space style={{ padding: '0 16px' }}>
          <Text type="secondary">
            <LoadingOutlined />
          </Text>
          <Text type="secondary">保存中</Text>
        </Space>
      );
    }
    return (
      <Space style={{ padding: '0 16px' }}>
        <Text type="success">
          <CheckOutlined />
        </Text>
        <Text type="success">已保存</Text>
      </Space>
    );
  }, [saving]);

  return (
    <div className={styles.materialConfig} id="global-config-material">
      <Tabs
        items={[
          {
            label: 'npm 包管理',
            key: 'packages',
            children: (
              <PackagesManangement
                assets={assets}
                id={id}
                onChange={packages => onSave({ packages })}
                tree={tree}
              />
            ),
          },
          {
            // 低码组件只在组件管理中保存，也就是只保存在 assets.components 中，
            // 组件面板加载组件的时候再做筛选和低码组件的加载
            label: '组件管理',
            key: 'components',
            children: (
              <ComponentsManangement
                assets={assets}
                onChange={components => onSave({ components })}
              />
            ),
          },
          {
            label: '其他设置',
            key: 'others',
            children: (
              <OthersConfig
                initialValues={othersConfig}
                onChange={values => onSaveDebounce(values)}
              />
            ),
          },
        ]}
        tabBarExtraContent={{
          right: SavingContent,
        }}
        type="card"
      />
    </div>
  );
};

export default ConfigSetting;
