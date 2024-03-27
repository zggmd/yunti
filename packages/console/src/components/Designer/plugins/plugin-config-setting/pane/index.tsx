import { project } from '@alilc/lowcode-engine';
import { IPublicEnumTransformStage, IPublicTypeAssetsJson } from '@alilc/lowcode-types';
import { CheckOutlined, LoadingOutlined } from '@ant-design/icons';
import { Space, Tabs, Typography } from 'antd';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { injectSchema, saveAuthData } from '@/components/Designer/utils';

import { PaneInjectProps } from '../../../type';
import BasicSetting from './basic';
import styles from './index.less';
import MetaSetting from './meta';
import OthersSetting from './others';

/**
 * 重构思路：
 * 1.参考 vscode 设置，使用 antd tab + Anchor 组件组织各个配置项：antd 配置，元数据 meta 配置，其他配置（version ？）
 * 2.调整下 antd config-provider 配置在 schema.config 中的层级，建议调整到 schema.config.antd.configProvider 中
 * 3.只展示部分字段的可视化配置，点击切换为 Monaco editor 进行编辑
 */

const { Text } = Typography;

const ConfigSetting: React.FC<PaneInjectProps> = props => {
  const { schema, assets, onSchemaAndAssetsSave } = props;
  const [saving, setSaving] = useState<boolean>();
  const setSavingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => clearTimeout(setSavingTimeoutRef.current);
  }, []);

  const othersConfig = useMemo(
    () =>
      Object.assign(
        { assets },
        { schema },
        {
          schema: {
            componentsMap: undefined,
            componentsTree: undefined,
            i18n: undefined,
            meta: undefined,
            utils: undefined,
            config: undefined,
            constants: undefined,
          },
        }
      ),
    [assets, schema]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onSave = useCallback(
    debounce(async (newSchema?: Record<string, any>, newAssets?: IPublicTypeAssetsJson) => {
      clearTimeout(setSavingTimeoutRef.current);
      setSaving(true);
      // 保存 schema
      await onSchemaAndAssetsSave(newSchema, newAssets);
      setSaving(false);
      setSavingTimeoutRef.current = setTimeout(() => setSaving(), 1000);
      // 将新的 schema 导入到设计器中
      let projectSchema = project.exportSchema(IPublicEnumTransformStage.Save);
      Object.assign(projectSchema, newSchema);
      // @ts-ignore
      projectSchema = injectSchema(projectSchema);
      project.importSchema(projectSchema);
      const currentDocument = project.getCurrentDocument();
      if (currentDocument) {
        project.removeDocument(currentDocument);
      }
      project.openDocument(projectSchema.componentsTree?.[0]);
      // 保存 authData 到本地存储中
      if (newSchema.config?.authData) {
        saveAuthData(newSchema.config.authData);
      }
    }, 500),
    []
  );

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
    <div className={styles.globalConfigSetter} id="global-config-setter">
      <Tabs
        items={[
          {
            label: '基础设置',
            key: 'basic',
            children: (
              <BasicSetting
                initialValues={schema?.config}
                onChange={config => onSave({ config })}
              />
            ),
          },
          {
            label: '元数据设置',
            key: 'meta',
            children: (
              <MetaSetting initialValues={schema?.meta || {}} onChange={meta => onSave({ meta })} />
            ),
          },
          {
            label: '其他设置',
            key: 'others',
            children: (
              <OthersSetting
                initialValues={othersConfig}
                onChange={config => onSave(config.schema, config.assets)}
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
