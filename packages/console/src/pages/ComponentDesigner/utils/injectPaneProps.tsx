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
    const { componentId } = useMatch({ path: 'design/components/:componentId' })?.params || {};
    const tree = getTreeById(componentId);
    const sdk = useSdk({ tree });
    const { data, mutate } = sdk.useGetComponent({ id: componentId });
    const allProps: PaneInjectProps = {
      id: componentId,
      tree,
      schema: data?.component?.schema,
      assets: data?.component?.assets,
      i18nUsage: data?.component?.i18nUsage,
      onSchemaSave: async (newSchema: any) => {
        const res = await sdk.updateComponent({
          component: {
            id: componentId,
            schema: Object.assign(data?.component?.schema, newSchema),
          },
        });
        await mutate();
        return res?.componentUpdate?.schema;
      },
      onI18nSave: async (i18n: IPublicTypeI18nMap) => {
        const res = await sdk.updateComponentI18n({
          id: componentId,
          i18n,
        });
        await mutate();
        return res?.componentUpdateI18n;
      },
      onAssetsSave: async (assets: IPublicTypeAssetsJson) => {
        const res = await sdk.updateComponent({
          component: {
            id: componentId,
            assets,
          },
        });
        await mutate();
        return res?.componentUpdate;
      },
      onSchemaAndAssetsSave: async (newSchema?: any, assets?: IPublicTypeAssetsJson) => {
        await sdk.updateComponent({
          component: {
            id: componentId,
            schema: isEmpty(newSchema)
              ? undefined
              : Object.assign(data?.component?.schema, newSchema),
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
    const { componentId } = useMatch({ path: 'design/components/:componentId' })?.params || {};
    const sdk = useSdk({ tree: getTreeById(componentId) });
    const res = sdk.useGetComponentCommitsInfinite(
      (pageIndex, previousData) => {
        if (previousData && !previousData?.component?.commits?.hasNextPage) {
          return null;
        }
        return ['commitsArgs', { page: pageIndex + 1 }];
      },
      { id: componentId }
    );
    const { size, setSize, data, isLoading, mutate } = res;
    const commits = useMemo(() => data?.map(d => d?.component?.commits), [data]);
    const lastPaginedData = data?.[size - 1];
    const hasNextPage = lastPaginedData?.component?.commits?.hasNextPage;
    const injectProps: GitCommitPaneInjectProps = {
      commits,
      loading: isLoading,
      doCommit: async (message: string) => {
        await sdk.commitComponent({ id: componentId, message });
        await mutate();
      },
      loadMore: () => setSize(size + 1),
      loadMoreLoading: !lastPaginedData,
      hasNextPage: hasNextPage === undefined ? true : hasNextPage,
      commitInputPlaceholder: `请填写提交信息，默认会带上 'Update component component-xxxxx: ' 的前缀 '`,
    };
    return <Pane {...props} {...injectProps} />;
  };
  return PropsProviderWrapper;
};

export const injectPreviewModalProps = (Pane: React.FC<PreviewModalInjectProps>) => {
  const PropsProviderWrapper: React.FC = props => {
    const { componentId } = useMatch({ path: 'design/components/:componentId' })?.params || {};
    const previewSrc = useMemo(
      () => `/preview/component?componentId=${componentId}`,
      [componentId]
    );
    const injectProps: PreviewModalInjectProps = { previewSrc };
    return <Pane {...props} {...injectProps} />;
  };
  return PropsProviderWrapper;
};

export const getAssets = async () => {
  const match = matchPath({ path: 'design/components/:componentId' }, history.location.pathname);
  const { componentId } = match.params || {};
  const sdk = initSdk({ tree: getTreeById(componentId) });
  const { component } = await sdk.getComponent({ id: componentId });
  return component?.assets;
};
