import {
  IPublicTypeAssetsJson,
  IPublicTypeI18nMap,
  IPublicTypePackage,
  IPublicTypeProjectSchema,
  IPublicTypeReference,
} from '@alilc/lowcode-types';
import { UpdateAppMutation, UpdateComponentMutation } from '@tenx-ui/yunti-bff-client';
import React from 'react';

import type { ConstantsSchema, UtilsSchema } from './plugins/plugin-app-helper';

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type Merge<M, N> = Omit<M, Extract<keyof M, keyof N>> & N;

export type DesignerProjectSchema = Merge<
  IPublicTypeProjectSchema,
  {
    constants?: ConstantsSchema;
    utils?: UtilsSchema;
  }
>;
export interface PaneInjectProps {
  /** 应用/组件的 id */
  id: string;
  /** 当前的分支、版本或提交 */
  tree: string;
  /** 当前设计器的 schema 结构 */
  schema?: DesignerProjectSchema;
  /** 当前设计器的资产包结构 */
  assets?: IPublicTypeAssetsJson;
  /**  */
  i18nUsage?: object;
  /** 保存 schema 的回调函数 */
  onSchemaSave?: (schema: object) => Promise<DesignerProjectSchema>;
  /** 保存 i18n 的回调函数 */
  onI18nSave?: (i18n: IPublicTypeI18nMap) => Promise<IPublicTypeI18nMap>;
  /** 保存 assets 的回调函数 */
  onAssetsSave?: (
    assets: IPublicTypeAssetsJson
  ) => Promise<UpdateAppMutation['appUpdate'] | UpdateComponentMutation['componentUpdate']>;
  /** 保存 schema 和 assets 的回调函数 */
  onSchemaAndAssetsSave?: (schema?: object, assets?: IPublicTypeAssetsJson) => Promise<void>;
}

export type PaneInjectPropsKeys = (keyof PaneInjectProps)[];

export type InjectPanePropsFunc = (
  pane: React.FC,
  injectPropsKeys: PaneInjectPropsKeys
) => React.FC<PaneInjectProps>;

export interface PluginRegisterOptions {
  injectPaneProps: InjectPanePropsFunc;
  injectPropsKeys?: PaneInjectPropsKeys;
}

export enum PluginIsInited {
  /** 未初始化 */
  uninitialized = 'uninitialized',
  /** 初始化中 */
  initializing = 'initializing',
  /** 初始化完成 */
  initialized = 'initialized',
}

export type LowCodePackage = IPublicTypePackage & {
  type?: 'lowCode' | 'proCode';
  disabled?: boolean;
  /** 增加 name 字段是为了 npm 包管理展示用 */
  name?: string;
  /** 组件低码配置 */
  meta?: {
    url: string;
    exportName: string;
  };
  /** 组件外部依赖 */
  externalsPkgs?: {
    name: string;
    version: string;
  }[];
};

export type LowCodePackaReference = IPublicTypeReference & {
  /** 增加 name 字段是为了组件管理展示用 */
  name: string;
};
