// https://github.com/alibaba/lowcode-demo/blob/main/demo-lowcode-component/src/parse-assets.ts
import { injectComponents } from '@alilc/lowcode-plugin-inject';
import {
  IPublicTypeAssetsJson,
  IPublicTypeComponentDescription,
  IPublicTypeComponentMap,
  IPublicTypeComponentSchema,
  IPublicTypeLowCodeComponent,
  IPublicTypePackage,
  IPublicTypeProjectSchema,
  IPublicTypeRemoteComponentDescription,
} from '@alilc/lowcode-types';
import { AssetLoader, buildComponents } from '@alilc/lowcode-utils';
import { Component } from '@tenx-ui/materials';
import React, { createElement } from 'react';

import { getLangInfo } from '@/components/ChangeLocale';

import { DesignerProjectSchema } from '../../type';
import { componentNameToId } from '../../utils';
import Renderer from './renderer';

export interface LibraryMap {
  [key: string]: string;
}

function genLowcodeComp(
  schema: IPublicTypeProjectSchema<IPublicTypeComponentSchema>,
  components: any,
  libraryMap: LibraryMap
) {
  return class LowcodeComp extends React.Component {
    render(): React.ReactNode {
      return createElement(Renderer, {
        ...this.props,
        libraryMap,
        projectSchema: schema as unknown as DesignerProjectSchema,
        rendererName: 'LowCodeRenderer',
        locale: getLangInfo().i18nKey,
        messages: schema?.i18n || {},
        schema: schema?.componentsTree?.[0],
        components,
        designMode: '',
      });
    }
  };
}

// @Todo: 这里可能需要针对 componentName 是 Component 的做下特殊处理
const createComponent = (schema: IPublicTypeProjectSchema<IPublicTypeComponentSchema>) => {
  console.warn('Can not create Component =>', schema);
  return (window as any).TenxUiMaterials?.['Component'] || Component;
};

export async function parseAssets(assets: IPublicTypeAssetsJson) {
  const { components: rawComponents, packages } = assets;

  const libraryAsset = [];
  const libraryMap: LibraryMap = {};
  const packagesMap: Record<string, IPublicTypePackage> = {};
  for (const pkg of packages) {
    const { package: _package, library, urls, renderUrls, id } = pkg;
    if (_package) {
      libraryMap[id || _package] = library;
    }
    packagesMap[id || _package] = pkg;
    if (renderUrls) {
      libraryAsset.push(renderUrls);
    } else if (urls) {
      libraryAsset.push(urls);
    }
  }

  const assetLoader = new AssetLoader();
  await assetLoader.load(libraryAsset);

  let newComponents = rawComponents;
  if (rawComponents && rawComponents.length > 0) {
    const componentDescriptions: IPublicTypeComponentDescription[] = [];
    const remoteComponentDescriptions: IPublicTypeRemoteComponentDescription[] = [];
    rawComponents.forEach((component: any) => {
      if (!component) {
        return;
      }
      if (component.exportName && component.url) {
        remoteComponentDescriptions.push(component);
      } else {
        componentDescriptions.push(component);
      }
    });
    newComponents = [...componentDescriptions];

    // 如果有远程组件描述协议，则自动加载并补充到资产包中，同时触发 designer.incrementalAssetsReady 通知组件面板更新数据
    if (remoteComponentDescriptions && remoteComponentDescriptions.length > 0) {
      await Promise.all(
        remoteComponentDescriptions.map(async (component: any) => {
          const { exportName, url, npm } = component;
          await new AssetLoader().load(url);
          function setAssetsComponent(component: any, extraNpmInfo: any = {}) {
            const components = component.components;
            if (Array.isArray(components)) {
              for (const d of components) {
                newComponents = newComponents.concat(
                  {
                    npm: {
                      ...npm,
                      ...extraNpmInfo,
                    },
                    ...d,
                  } || []
                );
              }
              return;
            }
            newComponents = newComponents.concat(
              {
                npm: {
                  ...npm,
                  ...extraNpmInfo,
                },
                ...component.components,
              } || []
            );
            // assets.componentList = assets.componentList.concat(component.componentList || []);
          }
          function setArrayAssets(
            value: any[],
            preExportName: string = '',
            preSubName: string = ''
          ) {
            value.forEach((d: any, i: number) => {
              const exportName = [preExportName, i.toString()].filter(d => !!d).join('.');
              const subName = [preSubName, i.toString()].filter(d => !!d).join('.');
              Array.isArray(d)
                ? setArrayAssets(d, exportName, subName)
                : setAssetsComponent(d, {
                    exportName,
                    subName,
                  });
            });
          }
          if (window[exportName]) {
            if (Array.isArray(window[exportName])) {
              setArrayAssets(window[exportName] as any);
            } else {
              setAssetsComponent(window[exportName] as any);
            }
          }
          return window[exportName];
        })
      );
    }
  }
  const lowcodeComponentsArray = [];
  const proCodeComponentsMap = newComponents.reduce((acc, cur) => {
    if ((cur.devMode || '').toLowerCase() === 'lowcode') {
      lowcodeComponentsArray.push(cur);
    } else {
      acc[cur.componentName] = {
        ...(cur.reference || cur.npm),
        componentName: cur.componentName,
      };
    }
    return acc;
  }, {});

  const getLowCodeComponentsMapFromSchema = (
    allComponents: IPublicTypeComponentDescription[],
    schema: IPublicTypeProjectSchema<IPublicTypeComponentSchema>
  ) => {
    const componentsMap = {};
    schema.componentsMap?.forEach((cm: IPublicTypeComponentMap) => {
      if ((cm as IPublicTypeLowCodeComponent).devMode?.toLowerCase() === 'lowcode') {
        const cmId = componentNameToId(cm.componentName);
        const cmSchema = packagesMap[cmId]?.schema;
        componentsMap[cm.componentName] = genLowcodeComp(
          cmSchema,
          getLowCodeComponentsMapFromSchema(allComponents, cmSchema),
          libraryMap
        );
        return;
      }
      componentsMap[cm.componentName] = components[cm.componentName];
    });
    return componentsMap;
  };

  function genLowCodeComponentsMap(allComponents: IPublicTypeComponentDescription[]) {
    const allLowcodeComponentsMap = {};
    for (const lowcode of lowcodeComponentsArray) {
      const id = lowcode.reference?.id;
      const schema = packagesMap[id]?.schema;
      const comp = genLowcodeComp(
        schema,
        getLowCodeComponentsMapFromSchema(allComponents, schema),
        libraryMap
      );
      allLowcodeComponentsMap[lowcode.componentName] = comp;
    }
    return allLowcodeComponentsMap;
  }

  let components = await injectComponents(
    buildComponents(libraryMap, proCodeComponentsMap, createComponent)
  );

  const lowCodeComponents = genLowCodeComponentsMap(components);

  return {
    components: { ...components, ...lowCodeComponents },
    libraryMap,
  };
}
