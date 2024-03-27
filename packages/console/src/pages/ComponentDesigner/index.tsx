import { common, skeleton } from '@alilc/lowcode-engine';
import { useSdk } from '@tenx-ui/yunti-bff-client';
import { useMatch } from '@umijs/max';
import { Button, Empty, Spin } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';

import { initPlugins } from '@/components/Designer/plugins';
import { message } from '@/layouts';
import { getTreeById } from '@/utils';

import { PluginIsInited, useAppHelper } from '../../components/Designer';
import registerPlugins from './plugins';
import { buildProjectSchema } from './utils';

// 可用于传递插件参数
const preference = new Map();
const Workbench = common.skeletonCabin.Workbench;

const PageDesigner: React.FC = () => {
  /** 插件是否已初始化成功，因为必须要等插件初始化后才能渲染 Workbench */
  const [isInited, setIsInited] = useState<PluginIsInited>(PluginIsInited.uninitialized);

  const { componentId } = useMatch({ path: 'design/components/:componentId' })?.params || {};
  const sdk = useSdk({ tree: getTreeById(componentId) });
  const { data: componentData, loading } = sdk.useGetComponent({ id: componentId });

  const projectSchema = useMemo(
    () => buildProjectSchema(componentData?.component?.schema),
    [componentData?.component?.schema]
  );
  const appHelper = useAppHelper(projectSchema);

  useEffect(() => {
    // 防止热更新重新注册插件报错
    if (isInited !== PluginIsInited.uninitialized) return;

    if (!componentData?.component) return;
    setIsInited(PluginIsInited.initializing);

    async function registerAndInitPlugins() {
      try {
        await registerPlugins({
          schema: projectSchema,
          assets: componentData?.component?.assets,
        });
        await initPlugins({ appHelper, registerOptions: preference });
        setIsInited(PluginIsInited.initialized);
      } catch (error) {
        console.warn(error);
        message.error('插件初始化失败');
      }
    }

    registerAndInitPlugins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appHelper]);

  if (loading === false && !componentData?.component) {
    return (
      <div className="designer-loading-box">
        <Empty description={<span>组件 {componentId} 不存在</span>}>
          <Button type="primary">管理组件</Button>
        </Empty>
      </div>
    );
  }

  if (isInited !== PluginIsInited.initialized) {
    return (
      <div className="designer-loading-box">
        <Spin size="large" tip="Loading Designer ..." />
      </div>
    );
  }

  return <Workbench skeleton={skeleton} />;
};

export default PageDesigner;
