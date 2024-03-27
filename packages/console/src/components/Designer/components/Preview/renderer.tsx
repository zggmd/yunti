import ReactRenderer from '@alilc/lowcode-react-renderer';
import { IRendererProps } from '@alilc/lowcode-renderer-core/lib/types';
import { GetAppQuery } from '@tenx-ui/yunti-bff-client';
import { matchPath } from '@umijs/max';
import { MemoryHistory } from 'history';
import React, { createElement, useCallback } from 'react';

import { DesignerProjectSchema, useAppHelper } from '@/components/Designer';

import { getLangInfo } from '../../../ChangeLocale';
import DataProvider from '../../../DataProvider';
import { LibraryMap } from './parse-assets';

export interface RendererProps extends IRendererProps {
  libraryMap?: LibraryMap;
  projectSchema: DesignerProjectSchema;
  pages?: GetAppQuery['app']['pages'];
  appId?: string;
}

const Renderer: React.FC<RendererProps> = (props: RendererProps) => {
  const { schema, projectSchema, libraryMap, pages, appId, ...otherProps } = props;

  const getRealWorldPath = useCallback(
    (location: MemoryHistory['location']) => {
      const targetPage = pages?.find(item => {
        const match = matchPath({ path: item.pathname }, location.pathname);
        return item.pathname === location.pathname || match;
      });
      return {
        name: targetPage?.title,
        pathname: targetPage?.id
          ? `/preview/page?appId=${appId}&pageId=${targetPage?.id}`
          : location.pathname,
      };
    },
    [appId, pages]
  );

  const appHelper = useAppHelper(projectSchema, {
    isMockLocation: true,
    libraryMap,
    preview: true,
    getRealWorldPath,
  });
  const self = {
    appHelper,
    ...appHelper,
    context: { appHelper },
    schema,
  };

  return (
    <DataProvider
      preview
      render={swrProps => (
        <ReactRenderer
          {...otherProps}
          {...swrProps}
          appHelper={appHelper}
          customCreateElement={(Comp: any, cProps: any, children: any) => {
            const { __id, __designMode, ...viewProps } = cProps;
            // mock _leaf，减少性能开销
            const _leaf = {
              isEmpty: () => false,
            };
            viewProps._leaf = _leaf;
            if (cProps?.schema?.componentName === 'Page') {
              const pageProps = {
                ...viewProps,
                locale: getLangInfo()?.locale,
                ...projectSchema?.config,
                theme: undefined,
              };
              return createElement(Comp, pageProps, children);
            }
            if (cProps?.schema?.componentName === 'Component') {
              const componentProps = {
                ...viewProps,
                locale: getLangInfo()?.locale,
                ...projectSchema?.config,
                theme: undefined,
              };
              return createElement(Comp, componentProps, children);
            }
            return createElement(Comp, viewProps, children);
          }}
          locale={getLangInfo().i18nKey}
          messages={projectSchema?.i18n || {}}
          schema={schema}
        />
      )}
      sdkInitFunc={schema?.props.sdkInitFunc}
      sdkSwrFuncs={schema?.props.sdkSwrFuncs}
      self={self}
    />
  );
};

export default Renderer;
