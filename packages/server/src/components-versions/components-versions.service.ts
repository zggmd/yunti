import {
  IPublicTypeAssetsJson,
  IPublicTypeLowCodeComponent,
  IPublicTypePackage,
  IPublicTypeProCodeComponent,
  IPublicTypeReference,
} from '@alilc/lowcode-types';
import { Injectable, Logger } from '@nestjs/common';
import { pascalCase } from 'change-case';
import { flatten, groupBy, merge, uniqBy } from 'lodash';
import * as semver from 'semver';

import { ComponentVersion } from '@/common/entities/components-versions.entity';
import { Component } from '@/common/entities/components.entity';
import treeDataSources from '@/common/tree-data-sources';
import { TREE_DEFAULT, semverLt } from '@/common/utils';
import { sortPackages } from '@/packages/utils';

export type LccList = Array<{
  /** 低码组件 id */
  id: string;
  /** 低码组件版本号 */
  version: string;
}>;

export type LccIdVersionMap = {
  [id: string]: string;
};

@Injectable()
export class ComponentsVersionsService {
  logger = new Logger('ComponentsVersionsService');

  getComponentsVersonsRepository = (tree: string) =>
    treeDataSources.getRepository<ComponentVersion>(tree, ComponentVersion);

  getComponentsRepository = (tree: string) =>
    treeDataSources.getRepository<Component>(tree, Component);

  async listComponentVersions(tree: string, componentId: string) {
    const componentsVersonsRepository = await this.getComponentsVersonsRepository(tree);
    const componentVersions = await componentsVersonsRepository.find({
      where: { componentId },
      // order: {
      //   version: 'DESC',
      // },
    });

    return semver
      .sort(componentVersions.map(({ version }) => version))
      .reverse()
      .map(version => componentVersions.find(cv => cv.version === version));
  }

  async getComponentVersion(tree: string, componentId: string, version: string) {
    const componentsVersonsRepository = await this.getComponentsVersonsRepository(tree);
    const componentVersion = await componentsVersonsRepository.findOneBy({
      componentId,
      version,
    });
    return componentVersion;
  }

  async getComponentVersionDetail(tree: string, componentId: string, version: string) {
    const method = 'getComponentVersionDetail';
    const componentsVersonsRepository = await this.getComponentsVersonsRepository(tree);
    const componentVersion = await componentsVersonsRepository.findOneBy({
      componentId,
      version,
    });
    if (!componentVersion) {
      this.logger.warn(
        `${method} faild => tree: ${tree}, componentId: ${componentId}, version: ${version}`
      );
      return;
    }

    const componentsRepository = await this.getComponentsRepository(componentVersion.commitId);
    const component = await componentsRepository.findOneBy({
      id: componentVersion.componentId,
    });
    component.schema.meta.version = version;
    componentVersion.component = component;
    return componentVersion;
  }

  /**
   * component-3a6ro => LccComponent3a6ro
   *
   * @param {string} id 低码组件 id
   */
  private componnetIdToName(id: string) {
    return `Lcc${pascalCase(id).replaceAll('_', '')}`;
  }

  /**
   * LccComponent3a6ro => component-3a6ro
   *
   * @param {string} name 资产中的低码组件名称
   */
  private componentNameToId(name: string) {
    return `component-${name.replace(/^LccComponent/, '').toLowerCase()}`;
  }

  /**
   * 根据低码组件列表获取低码资产
   *
   * @param {LccList} lccList 低码组件列表
   */
  async getLccListAssets(lccList: LccList, lccIdVersionMap: LccIdVersionMap = {}) {
    const cvList = await Promise.all(
      lccList.map(({ id, version }) => this.getComponentVersionDetail(TREE_DEFAULT, id, version))
    );
    const assets: IPublicTypeAssetsJson = {
      version: '1.1.0',
      packages: [],
      components: [],
    };
    // 低码组件依赖的低码组件
    const lccLccList: LccList = [];
    for (const cv of cvList) {
      if (!cv) {
        continue;
      }
      const { version, component } = cv;
      const componentName = this.componnetIdToName(component.id);
      const schema = component.schema;
      const metaFromProps: any = schema?.componentsTree?.[0]?.props?.__meta || {};
      const meta = merge(
        {
          componentId: component.id,
          componentName,
          version,
          title: component.name,
          description: component.description,
          devMode: 'lowCode',
          group: '低码组件',
          category: '其他',
          reference: {
            destructuring: false,
            id: component.id,
            // 增加 name 字段是为了组件管理展示用
            name: component.name,
            version,
          },
          snippets: [
            {
              title: component.name,
              // screenshot: require('./__screenshots__/iFrame.png'),
              schema: {
                componentName,
                props: {
                  __component_name: componentName,
                },
              },
            },
          ],
        },
        metaFromProps,
        {
          configure: {
            supports: {
              events: metaFromProps.configure?.supports?.events?.map(item => {
                if (item?.template?.type === 'JSExpression') {
                  item.template = item?.template?.value;
                }
                return item;
              }),
            },
          },
        }
      );
      delete schema?.componentsTree?.[0]?.props?.__meta;
      meta.snippets = meta.snippets?.map(snippet => {
        if (!snippet.schema) {
          snippet.schema = { props: {} };
        }
        if (!snippet.schema.props) {
          snippet.schema.props = {};
        }
        snippet.schema.componentName = componentName;
        snippet.schema.props.__component_name = componentName;
        return snippet;
      });
      assets.components.push(meta);

      // @Todo 目前低代码组件的生命周期需要定义到 methods 中，否则无法执行
      // 相关 bug：https://github.com/alibaba/lowcode-engine/issues/1081#issuecomment-1257955293
      if (schema?.componentsTree?.[0]?.lifeCycles) {
        Object.assign(schema.componentsTree[0].methods, schema.componentsTree[0].lifeCycles);
      }

      // 将低码组件 push 到资产中
      assets.packages.push({
        id: component.id,
        name: component.name,
        type: 'lowCode',
        version,
        schema,
      } as unknown as IPublicTypePackage);

      // 处理低码组件依赖的资产
      for (const lccCmp of component.assets.components)
        if (schema?.componentsMap)
          for (const cm of schema.componentsMap) {
            if ((cm as IPublicTypeLowCodeComponent).devMode?.toLowerCase() === 'lowcode') {
              const componentId = this.componentNameToId(cm.componentName);
              const currentVersion = lccIdVersionMap[componentId];
              if (componentId === lccCmp.reference?.id) {
                const version = lccCmp.reference?.version;
                if (
                  currentVersion &&
                  (version === currentVersion || semverLt(version, currentVersion))
                ) {
                  continue;
                }
                // 同一组件使用新的版本
                lccLccList.push({
                  id: componentId,
                  version,
                });
              }
              continue;
            }
          }

      if (component.assets.packages)
        for (const pkg of component.assets.packages) {
          if (
            // 组件依赖的 npm 包
            schema?.componentsMap?.some(
              cm =>
                (cm as IPublicTypeLowCodeComponent).devMode?.toLowerCase() !== 'lowcode' &&
                (cm as IPublicTypeProCodeComponent).package === pkg.package
            ) ||
            // utils 中依赖的 npm 包
            schema?.utils?.some(
              util => util.type === 'npm' && util.content?.package === pkg.package
            )
          ) {
            assets.packages.push({
              ...pkg,
              // 记录被依赖的低码组件
              pkgDependents: [
                {
                  id: component.id,
                  name: component.name,
                },
              ],
            } as unknown as IPublicTypePackage);
          }
        }
    }
    // 如果低码组件本身还有依赖的低码组件，需要获取对应组件的资产合并到全部资产中
    if (lccLccList.length > 0) {
      for (const { id, version } of lccList) {
        lccIdVersionMap[id] = version;
      }
      const lccLccAssets = await this.getLccListAssets(lccLccList, lccIdVersionMap);
      assets.components.push(
        // 过滤重复的组件
        ...lccLccAssets.components.filter(
          c => !assets.components.some(ac => ac.componentId === c.componentId)
        )
      );
      assets.packages.push(...lccLccAssets.packages);
    }
    return assets;
  }

  /**
   * 完善资产中的低码组件部分，并对 packages 进行排序
   *
   * @param {IPublicTypeAssetsJson} assets
   */
  async improveAndSortAssets(assets: IPublicTypeAssetsJson) {
    if (!assets) {
      return assets;
    }
    const lccList = assets.components
      .filter(c => c.devMode === 'lowCode')
      .map(c => c.reference) as LccList;
    const lccAssets = await this.getLccListAssets(lccList);

    const components = [
      ...assets.components
        .map(c => {
          if (!c.reference && c.npm) {
            c.reference = {
              ...c.npm,
              version: c.npm.version || 'latest',
            } as IPublicTypeReference;
          }
          if (c.reference) {
            // component 统一使用 id 作为唯一标识字段
            c.reference.id = c.reference.id || c.reference.package;
            delete c.npm;
            delete c.reference.package;
          }
          return c;
        })
        .filter(c => c.devMode !== 'lowCode'),
      ...lccAssets.components,
    ];

    const packagesRecord: Record<string, IPublicTypePackage> = {};
    const allPackages = [...assets.packages, ...lccAssets.packages].map(pkg => {
      // package 中的 package 字段不能删除，低码引擎中使用的是 package 这个字段
      pkg.id = pkg.id || pkg.package;
      return pkg;
    });
    const packagesGroups = groupBy(allPackages, 'id');
    for (const id of Object.keys(packagesGroups)) {
      const pkgs = packagesGroups[id];
      const pkgDependents = uniqBy(
        flatten(pkgs.map(pkg => (pkg as any).pkgDependents).filter(pkgDts => pkgDts?.length > 0)),
        'id'
      );
      for (const pkg of pkgs) {
        if (!packagesRecord[id]) {
          packagesRecord[id] = Object.assign(pkg, { pkgDependents });
          continue;
        }
        const currentVersion = packagesRecord[id].version;
        if (pkg.version === currentVersion || semverLt(pkg.version, currentVersion)) {
          continue;
        }
        packagesRecord[id] = Object.assign(pkg, { pkgDependents });
      }
      // 更新 components 中的组件版本
      const targetComponent = components.find(c => c.reference?.id === id);
      if (targetComponent) {
        targetComponent.version = packagesRecord[id].version;
        targetComponent.reference.version = packagesRecord[id].version;
      }
    }

    const packages = sortPackages(Object.values(packagesRecord), 'package');
    // 更新低码资产 schema.componentsMap 中的依赖版本，保证出码后的依赖一致
    for (const pkg of packages) {
      if ((pkg as any).type !== 'lowCode') {
        continue;
      }
      if (pkg.schema?.componentsMap)
        for (const cm of pkg.schema.componentsMap) {
          if ((cm as IPublicTypeLowCodeComponent).devMode === 'lowCode') {
            continue;
          }
          const targetPkg = packagesRecord[(cm as IPublicTypeProCodeComponent).package];
          if (targetPkg) {
            (cm as IPublicTypeProCodeComponent).version = targetPkg.version;
          }
        }
    }
    const newAssets: IPublicTypeAssetsJson = {
      ...assets,
      components,
      packages,
    };
    return newAssets;
  }
}
