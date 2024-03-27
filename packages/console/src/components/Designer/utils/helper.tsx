import { IRendererAppHelper } from '@alilc/lowcode-renderer-core/lib/types';
import { IPublicTypeProCodeComponent } from '@alilc/lowcode-types';
import { history as consoleHistory, createMemoryHistory, matchPath } from '@umijs/max';
import { createAxiosHandler } from '@yunti/lowcode-datasource-axios-handler';
import { Alert, AlertProps, Descriptions } from 'antd';
import { MemoryHistory } from 'history';
import { set, unionWith } from 'lodash';
import qs from 'query-string';
import { useEffect, useMemo, useState } from 'react';
// eslint-disable-next-line unicorn/prefer-node-protocol
import * as url from 'url';

// @Todo: 后续需要支持动态引入，考虑打包为 umd 引入
import { getLangInfo } from '@/components/ChangeLocale';
import { modal } from '@/layouts';

import { sdk as bcApisSdk } from '../../../../sdks/bc-apis-client';
import { ComponentMap, parseConstantsSchema, parseUtilsSchema } from '../plugins/plugin-app-helper';
import { DesignerProjectSchema } from '../type';

(window as any).__bff_sdk = bcApisSdk;

export interface BuildAppHelperOptions {
  /** 模拟 location */
  isMockLocation?: boolean;
  /** 资产包名与 umd 导出名的映射 */
  libraryMap?: { [key: string]: string };
  /** 是否为预览模式 */
  preview?: boolean;
  /** 根据模拟器中跳转的路由获取应该跳转的实际路由 */
  getRealWorldPath?: (
    location: MemoryHistory['location']
  ) => { name?: string; pathname: string } | undefined;
}

let unlisten: () => void;

const parseMockPath = (schema: DesignerProjectSchema, history: MemoryHistory) => {
  const path = schema?.componentsTree?.[0].meta?.router as string;
  const mockPath = (schema?.componentsTree?.[0]?.props?.__mock_path as string) || path;
  if (mockPath) {
    const { search, hash, pathname } = url.parse(mockPath);
    if (
      history.location.pathname === pathname &&
      history.location.search === search &&
      history.location.hash === hash
    ) {
      return;
    }
    return {
      match: matchPath({ path }, pathname),
      search,
      hash,
      pathname,
    };
  }
};

export const useAppHelper = (
  schema: DesignerProjectSchema,
  options: BuildAppHelperOptions = {}
) => {
  const { isMockLocation, libraryMap, preview, getRealWorldPath } = options;
  const history = useMemo(() => createMemoryHistory(), []);
  const [location, setLocation] = useState(history.location);
  const [preLocation, setPreLocation] = useState(history.location);
  const [match, setMatch] = useState(isMockLocation && parseMockPath(schema, history)?.match);
  useEffect(() => {
    unlisten?.();
    unlisten = history.listen(listener => {
      const newLocation = listener.location;
      setLocation(newLocation);
      // eslint-disable-next-line no-console
      console.log('路由切换为 =>', url.format(newLocation), listener);
      if (newLocation) {
        if (newLocation.state?.skip) {
          setPreLocation(listener.location);
          return;
        }
        // console.log('preLocation', preLocation)
        // console.log('newLocation', newLocation)
        if (newLocation.pathname !== preLocation.pathname) {
          const realWorldPath = getRealWorldPath?.(newLocation);
          let message = '未找到目标页面，无法跳转';
          let type: AlertProps['type'] = 'warning';
          let disabled = true;
          let pathname = '';
          if (realWorldPath) {
            message = '点击确定打开新窗口到对应页面进行编辑';
            type = 'info';
            disabled = false;
            if (preview) {
              consoleHistory.push(realWorldPath.pathname);
              setPreLocation(listener.location);
              // window.location.href = realWorldPath.pathname;
              return;
            }
            pathname = realWorldPath.pathname + '?__mock_path=' + newLocation.pathname;
          }
          modal.confirm({
            title: '确定是否跳转？',
            width: 520,
            content: (
              <div>
                <Alert message={message} type={type} />
                <Descriptions column={2} style={{ marginTop: 16 }}>
                  <Descriptions.Item label="跳转地址" span={2}>
                    {url.format(newLocation) || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="目标页面" span={2}>
                    {realWorldPath ? (
                      <a href={pathname} rel="noreferrer" target="_blank">
                        {realWorldPath.name}
                      </a>
                    ) : (
                      '-'
                    )}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            ),
            okButtonProps: { disabled },
            onOk: () => {
              // consoleHistory.push(pathname)
              // setPreLocation(listener.location);
              if (listener.action === 'PUSH') {
                history.back();
              }
              window.open(window.location.origin + pathname);
            },
            onCancel: () => {
              if (listener.action === 'PUSH') {
                history.back();
              }
            },
          });
        }
      }
    });
  }, [getRealWorldPath, history, preLocation, preview]);

  useEffect(() => {
    if (isMockLocation) {
      const { match: mockMatch, pathname, search } = parseMockPath(schema, history) || {};
      if (mockMatch) {
        setMatch(mockMatch);
        history.push(pathname, { skip: true });
        Object.assign(history, {
          query: qs.parse(search || ''),
          match: mockMatch,
        });
      }
    }
  }, [history, isMockLocation, schema]);

  if (!schema) {
    return;
  }
  let constants = {};
  let utils: any = {};
  if (libraryMap) {
    constants = parseConstantsSchema(schema?.constants);
  }
  utils = parseUtilsSchema(schema?.utils, libraryMap);
  const appHelper: IRendererAppHelper = {
    requestHandlersMap: {
      axios: createAxiosHandler(utils?.getAxiosHanlderConfig?.()),
    },
    utils: {
      bff: bcApisSdk,
      ...utils,
      router: {
        matchPath,
        url,
        qs,
      },
    },
    constants,
    get location() {
      // return history.location;
      return location;
    },
    history,
    match,
  };
  return appHelper;
};

/**
 * 将全局配置注入到渲染的 schema 中，用于渲染时获取主题配置等
 * 为了遵循协议规范，将全局配置注入到了 `meta.appConfig` 中
 *
 * @param {DesignerProjectSchema} schema
 * @return {DesignerProjectSchema} schema
 */
export const injectGlobalConfig = (schema: DesignerProjectSchema): DesignerProjectSchema => {
  if (!schema) {
    return schema;
  }
  set(schema, 'componentsTree[0].meta.appConfig.antd.configProvider', {
    locale: getLangInfo()?.locale,
    ...schema?.config,
    theme: {
      ...schema?.config?.antd?.configProvider?.theme,
    },
  });
  return schema;
};

/**
 * 将 utils 中 npm 类型的组件依赖注入到 componentsMap 中
 *
 * @param {DesignerProjectSchema} schema
 * @return {DesignerProjectSchema}  schema
 */
export const injectComponentsMapFromUtils = (
  schema: DesignerProjectSchema
): DesignerProjectSchema => {
  if (!schema) {
    return schema;
  }
  if (!schema.componentsMap) {
    schema.componentsMap = [];
  }
  if (schema.utils)
    for (const util of schema.utils) {
      if (util.type === 'npm') {
        schema.componentsMap.push(util.content as ComponentMap);
      }
    }
  schema.componentsMap = unionWith(
    schema.componentsMap,
    (cmA: IPublicTypeProCodeComponent, cmB: IPublicTypeProCodeComponent) =>
      cmA.package === cmB.package &&
      cmA.subName === cmB.subName &&
      cmA.componentName === cmB.componentName
  );
  return schema;
};

/**
 * 向 schema 中注入必要的数据
 *
 * @param {DesignerProjectSchema} schema
 * @return {DesignerProjectSchema}  schema
 */
export const injectSchema = (schema: DesignerProjectSchema): DesignerProjectSchema => {
  return injectComponentsMapFromUtils(injectGlobalConfig(schema));
};

export const AUTH_DATA = 'authData';
export const getAuthData = () => {
  return JSON.parse(localStorage.getItem(AUTH_DATA) || '{}');
};

export const saveAuthData = (data: any) => {
  return localStorage.setItem(AUTH_DATA, JSON.stringify(data));
};

export const componentNameToId = (name: string) =>
  `component-${name.replace(/^LccComponent/, '').toLowerCase()}`;
