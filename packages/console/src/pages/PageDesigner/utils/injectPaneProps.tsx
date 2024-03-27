import { IPublicTypeAssetsJson, IPublicTypeI18nMap } from '@alilc/lowcode-types';
import { initSdk, useSdk } from '@tenx-ui/yunti-bff-client';
import { history, matchPath, useMatch } from '@umijs/max';
import { isEmpty } from 'lodash';
import React, { useMemo } from 'react';

import { GitCommitPaneInjectProps } from '@/components/Designer/plugins';
import { PreviewModalInjectProps } from '@/components/Designer/plugins/plugin-preview/components/PreviewModal';
import { getTreeById } from '@/utils';

import { PaneInjectProps, PaneInjectPropsKeys } from '../../../components/Designer/type';

export const injectPaneProps = (
  Pane: React.FC<PaneInjectProps>,
  injectPropsKeys?: PaneInjectPropsKeys
) => {
  const PropsProviderWrapper: React.FC = props => {
    const { appId } = useMatch({ path: 'design/apps/:appId/pages/:pageId' })?.params || {};
    const tree = getTreeById(appId);
    const sdk = useSdk({ tree });
    const { data, mutate } = sdk.useGetApp({ id: appId, tree });
    const allProps: PaneInjectProps = {
      id: appId,
      tree,
      schema: data?.app?.schema,
      assets: data?.app?.assets,
      i18nUsage: data?.app?.i18nUsage,
      onSchemaSave: async (newSchema: any) => {
        const res = await sdk.updateApp({
          app: {
            id: appId,
            schema: Object.assign(data?.app?.schema, newSchema),
          },
        });
        await mutate();
        return res?.appUpdate?.schema;
      },
      onI18nSave: async (i18n: IPublicTypeI18nMap) => {
        const res = await sdk.updateAppI18n({
          id: appId,
          i18n,
        });
        await mutate();
        return res?.appUpdateI18n;
      },
      onAssetsSave: async (assets: IPublicTypeAssetsJson) => {
        const res = await sdk.updateApp({
          app: {
            id: appId,
            assets,
          },
        });
        await mutate();
        return res?.appUpdate;
      },
      onSchemaAndAssetsSave: async (newSchema?: any, assets?: IPublicTypeAssetsJson) => {
        await sdk.updateApp({
          app: {
            id: appId,
            schema: isEmpty(newSchema) ? undefined : Object.assign(data?.app?.schema, newSchema),
            assets,
          },
        });
        await mutate();
      },
    };
    if (!injectPropsKeys || injectPropsKeys.length === 0) {
      return <Pane {...props} {...allProps} />;
    }
    const injectProps: PaneInjectProps = {
      id: allProps.id,
      tree: allProps.tree,
    };
    injectPropsKeys?.forEach((key: string) => {
      injectProps[key] = allProps[key];
    });

    return <Pane {...props} {...injectProps} />;
  };
  return PropsProviderWrapper;
};

export const injectGitCommitPaneProps = (Pane: React.FC<GitCommitPaneInjectProps>) => {
  const PropsProviderWrapper: React.FC = props => {
    const { appId, pageId } = useMatch({ path: 'design/apps/:appId/pages/:pageId' })?.params || {};
    const sdk = useSdk({ tree: getTreeById(appId) });
    const res = sdk.useGetPageCommitsInfinite(
      (pageIndex, previousData) => {
        if (previousData && !previousData?.page?.commits?.hasNextPage) {
          return null;
        }
        return ['commitsArgs', { page: pageIndex + 1 }];
      },
      { id: pageId }
    );
    const { size, setSize, data, isLoading, mutate } = res;
    const commits = useMemo(() => data?.map(d => d?.page?.commits), [data]);
    const lastPaginedData = data?.[size - 1];
    const hasNextPage = lastPaginedData?.page?.commits?.hasNextPage;
    const injectProps: GitCommitPaneInjectProps = {
      commits,
      loading: isLoading,
      doCommit: async (message: string) => {
        await sdk.commitPage({ id: pageId, message });
        await mutate();
      },
      loadMore: () => setSize(size + 1),
      loadMoreLoading: !lastPaginedData,
      hasNextPage: hasNextPage === undefined ? true : hasNextPage,
    };
    return <Pane {...props} {...injectProps} />;
  };
  return PropsProviderWrapper;
};

export const injectPreviewModalProps = (Pane: React.FC<PreviewModalInjectProps>) => {
  const PropsProviderWrapper: React.FC = props => {
    const { appId, pageId } = useMatch({ path: 'design/apps/:appId/pages/:pageId' })?.params || {};
    const previewSrc = useMemo(
      () => `/preview/page?appId=${appId}&pageId=${pageId}`,
      [appId, pageId]
    );
    const injectProps: PreviewModalInjectProps = { previewSrc };
    return <Pane {...props} {...injectProps} />;
  };
  return PropsProviderWrapper;
};

export const getAssets = async () => {
  const match = matchPath({ path: 'design/apps/:appId/pages/:pageId' }, history.location.pathname);
  const { appId } = match.params || {};
  const sdk = initSdk({ tree: getTreeById(appId) });
  const { app } = await sdk.getApp({ id: appId });
  return app?.assets;
};
