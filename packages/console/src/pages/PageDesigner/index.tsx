import { common, event, project, skeleton } from '@alilc/lowcode-engine';
import { GetPageQuery, useSdk } from '@tenx-ui/yunti-bff-client';
import { history, matchRoutes, useMatch } from '@umijs/max';
import { Button, Empty, Spin } from 'antd';
import { MemoryHistory } from 'history';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { initPlugins } from '@/components/Designer/plugins';
import { message } from '@/layouts';
import { getTreeById } from '@/utils';

import { PluginIsInited, useAppHelper } from '../../components/Designer';
import registerPlugins from './plugins';
import { buildProjectSchemaFromAppAndPage } from './utils';

// 可用于传递插件参数
const preference = new Map();
const Workbench = common.skeletonCabin.Workbench;

const PageDesigner: React.FC = () => {
  /** 插件是否已初始化成功，因为必须要等插件初始化后才能渲染 Workbench */
  const [isInited, setIsInited] = useState<PluginIsInited>(PluginIsInited.uninitialized);
  const [pageLoading, setPageLoading] = useState(false);
  const [pageData, setPageData] = useState<GetPageQuery>();

  const { appId, pageId } = useMatch({ path: 'design/apps/:appId/pages/:pageId' })?.params || {};
  const tree = getTreeById(appId);
  const sdk = useSdk({ tree });
  const { data: appData, loading: appLoading } = sdk.useGetApp({ id: appId });
  // 注意：由于 useSWR 自带缓存，这里不能直接使用 useGetPage 来获取页面数据，
  // 否则会导致 openDocument 时拿到的页面数据为缓存的老数据
  useEffect(() => {
    const getPage = async () => {
      setPageLoading(true);
      setPageData(null);
      try {
        const data = await sdk.getPage({ id: pageId });
        setPageData(data);
      } catch (error) {
        console.warn('get page failed =>', error);
        message.warning('获取页面信息失败');
      } finally {
        setPageLoading(false);
      }
    };
    getPage();
  }, [pageId, sdk]);
  const projectSchema = useMemo(
    () => buildProjectSchemaFromAppAndPage(appData?.app, pageData?.page),
    [appData?.app, pageData?.page]
  );
  useEffect(() => {
    const initProjectSchema = async () => {
      if (isInited !== PluginIsInited.initialized) {
        return;
      }
      message.destroy();
      if (!projectSchema) {
        if (pageLoading) {
          message.loading('切换页面中 ...', 0);
        }
        return;
      }

      const currentDocument = project.getCurrentDocument();
      if (currentDocument) {
        // 页面 schema 仅初始化一次，初始化多次可能会导致未保存的内容丢失
        if (currentDocument.root.id === pageId) {
          return;
        }
        project.removeDocument(currentDocument);
      }
      const newDocument = projectSchema.componentsTree[0];
      if (!newDocument) {
        return;
      }
      if (newDocument.id !== pageId) {
        return;
      }
      project.openDocument(newDocument);
      // 加载中英文
      project.setI18n(appData?.app?.schema?.i18n);
      event.emit('skeleton.panel-dock.active', 'codeEditor');
    };
    initProjectSchema();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId, projectSchema]);

  const getRealWorldPath = useCallback(
    (location: MemoryHistory['location']) => {
      // @Todo: 如果有一些重定向的路由没有定义的话，可能会匹配不到，例如应用列表-应用详情的跳转
      const routes =
        appData?.app?.pages?.map(p => ({ path: p.pathname, name: p.title, id: p.id })) || [];
      const routesMatch = matchRoutes(routes, location);
      if (!routesMatch || routesMatch.length === 0) {
        return;
      }
      const targetRoute = routesMatch[0];
      return {
        name: targetRoute.route.name,
        pathname: `/design/apps/${appId}/pages/${targetRoute.route.id}`,
      };
    },
    [appData?.app?.pages, appId]
  );

  const appHelper = useAppHelper(projectSchema, { isMockLocation: true, getRealWorldPath });

  useEffect(() => {
    // 防止热更新重新注册插件报错
    if (isInited !== PluginIsInited.uninitialized) return;

    if (!appHelper || !projectSchema) return;
    setIsInited(PluginIsInited.initializing);

    async function registerAndInitPlugins() {
      try {
        await registerPlugins({ schema: projectSchema, assets: appData?.app?.assets });
        await initPlugins({ appHelper, registerOptions: preference });
        setIsInited(PluginIsInited.initialized);
      } catch (error) {
        console.warn(error);
        message.error('插件初始化失败');
      }
    }

    registerAndInitPlugins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appHelper, projectSchema]);

  if (appLoading === false && !appData?.app) {
    return (
      <div className="designer-loading-box">
        <Empty description={<span>应用 {appId} 不存在</span>}>
          <Button onClick={() => history.push('/apps')} type="primary">
            管理应用
          </Button>
        </Empty>
      </div>
    );
  }

  if (pageLoading === false && !pageData?.page) {
    return (
      <div className="designer-loading-box">
        <Empty description={<span>页面 {pageId} 不存在</span>}>
          <Button onClick={() => history.push(`/apps/${appId}`)} type="primary">
            管理页面
          </Button>
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
