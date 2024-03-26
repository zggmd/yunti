// <remove>
/**
 * 模板
 * 用作 cluster crd 资源 class 生成
 */
// </remove>

import http from 'http';
import * as K8s from '@kubernetes/client-node';
import {
  CreateOptions,
  PatchOptions,
  JsonPatchOp,
  DeleteOptions,
  DeleteCollectionOptions,
  ReadOptions,
  ListOptions,
  CRD,
} from '../interfaces';
import {
  JSON_PATCH_CONTENT_TYPE,
  MERGE_PATCH_CONTENT_TYPE,
  STRATEGIC_MERGE_PATCH_CONTENT_TYPE,
} from '../utils/constants';
import { TimeExec } from '../decorators/time-exec.decorator';

export const USER_CRD_SPEC = {
  kind: 'User',
  listKind: 'UserList',
  plural: 'users',
  singular: 'user',
  scope: 'Cluster',
  group: 'iam.tenxcloud.com',
  version: 'v1alpha1',
};

const { kind, group, version, plural } = USER_CRD_SPEC;
const DEFAULT_BODY = {
  kind,
  apiVersion: `${group}/${version}`,
};

/**
 * @category crd
 */
@TimeExec()
export class User {
  constructor(private readonly k8sApi: K8s.CustomObjectsApi) {}

  kind = kind;
  name = plural;
  namespaced = false;
  group = group;
  version = version;

  /**
   * 创建 User
   *
   * @param {CRD.User} body User 对象
   * @param {CreateOptions} [options] 可选配置项
   */
  create(body: CRD.User, options?: CreateOptions) {
    const { pretty, dryRun, fieldManager, headers } = options || {};
    return this.k8sApi.createClusterCustomObject(
      group,
      version,
      plural,
      Object.assign({}, DEFAULT_BODY, body),
      pretty,
      dryRun,
      fieldManager,
      { headers },
    ) as Promise<{
      response: http.IncomingMessage;
      body: CRD.User;
    }>;
  }

  /**
   * 替换指定的 User
   *
   * @param {string} name User 名称
   * @param {CRD.User} body User 对象
   * @param {CreateOptions} [options] 可选配置项
   */
  replace(name: string, body: CRD.User, options?: CreateOptions) {
    const { dryRun, fieldManager, headers } = options || {};
    return this.k8sApi.replaceClusterCustomObject(
      group,
      version,
      plural,
      name,
      Object.assign({}, DEFAULT_BODY, body),
      dryRun,
      fieldManager,
      { headers },
    ) as Promise<{
      response: http.IncomingMessage;
      body: CRD.User;
    }>;
  }

  /**
   * 部分更新指定的 User (JSON Patch)
   *
   * @param {string} name User 名称
   * @param {JsonPatchOp[]} body User patch json 对象
   * @param {PatchOptions} [options] 可选配置项
   */
  patch(name: string, body: JsonPatchOp[], options?: PatchOptions) {
    const { dryRun, fieldManager, force, headers } = options || {};
    return this.k8sApi.patchClusterCustomObject(
      group,
      version,
      plural,
      name,
      body,
      dryRun,
      fieldManager,
      force,
      {
        headers: Object.assign({}, headers, {
          'Content-Type': JSON_PATCH_CONTENT_TYPE,
        }),
      },
    ) as Promise<{
      response: http.IncomingMessage;
      body: CRD.User;
    }>;
  }

  /**
   * 部分更新指定的 User (Merge Patch)
   *
   * @param {string} name User 名称
   * @param {object} body User 对象
   * @param {PatchOptions} [options] 可选配置项
   */
  patchMerge(name: string, body: object, options?: PatchOptions) {
    const { dryRun, fieldManager, force, headers } = options || {};
    return this.k8sApi.patchClusterCustomObject(
      group,
      version,
      plural,
      name,
      body,
      dryRun,
      fieldManager,
      force,
      {
        headers: Object.assign({}, headers, {
          'Content-Type': MERGE_PATCH_CONTENT_TYPE,
        }),
      },
    ) as Promise<{
      response: http.IncomingMessage;
      body: CRD.User;
    }>;
  }

  /**
   * 部分更新指定的 User (Strategic Merge Patch)
   *
   * @param {string} name User 名称
   * @param {object} body User 对象
   * @param {PatchOptions} [options] 可选配置项
   */
  patchStrategicMerge(name: string, body: object, options?: PatchOptions) {
    const { dryRun, fieldManager, force, headers } = options || {};
    return this.k8sApi.patchClusterCustomObject(
      group,
      version,
      plural,
      name,
      body,
      dryRun,
      fieldManager,
      force,
      {
        headers: Object.assign({}, headers, {
          'Content-Type': STRATEGIC_MERGE_PATCH_CONTENT_TYPE,
        }),
      },
    ) as Promise<{
      response: http.IncomingMessage;
      body: CRD.User;
    }>;
  }

  /**
   * 根据名称删除一个  User
   *
   * @param {string} name User 名称
   * @param {DeleteOptions} [options] 可选配置项
   */
  delete(name: string, options?: DeleteOptions) {
    const {
      dryRun,
      gracePeriodSeconds,
      orphanDependents,
      propagationPolicy,
      body,
      headers,
    } = options || {};
    return this.k8sApi.deleteClusterCustomObject(
      group,
      version,
      plural,
      name,
      gracePeriodSeconds,
      orphanDependents,
      propagationPolicy,
      dryRun,
      body,
      { headers },
    ) as Promise<{
      response: http.IncomingMessage;
      body: K8s.V1Status;
    }>;
  }

  /**
   * 根据选择器删除多个 User
   *
   * @param {DeleteCollectionOptions} [options] 可选配置项
   */
  deleteCollection(options?: DeleteCollectionOptions) {
    const {
      pretty,
      dryRun,
      gracePeriodSeconds,
      orphanDependents,
      propagationPolicy,
      body,
      headers,
    } = options || {};
    return this.k8sApi.deleteCollectionClusterCustomObject(
      group,
      version,
      plural,
      pretty,
      gracePeriodSeconds,
      orphanDependents,
      propagationPolicy,
      dryRun,
      body,
      { headers },
    ) as Promise<{
      response: http.IncomingMessage;
      body: K8s.V1Status;
    }>;
  }

  /**
   * 根据名称获取 User 详情
   *
   * @param {string} name User 名称
   * @param {ListOptions} [options] 可选配置项
   */
  read(name: string, options?: ReadOptions) {
    const { headers } = options || {};
    return this.k8sApi.getClusterCustomObject(group, version, plural, name, {
      headers,
    }) as Promise<{
      response: http.IncomingMessage;
      body: CRD.User;
    }>;
  }

  /**
   * 列取 User 列表
   *
   * @param {ListOptions} [options] 可选配置项
   */
  list(options?: ListOptions) {
    const {
      pretty,
      allowWatchBookmarks,
      _continue,
      fieldSelector,
      labelSelector,
      limit,
      resourceVersion,
      resourceVersionMatch,
      timeoutSeconds,
      watch,
      headers,
    } = options || {};
    return this.k8sApi.listClusterCustomObject(
      group,
      version,
      plural,
      pretty,
      allowWatchBookmarks,
      _continue,
      fieldSelector,
      labelSelector,
      limit,
      resourceVersion,
      resourceVersionMatch,
      timeoutSeconds,
      watch,
      { headers },
    ) as Promise<{
      response: http.IncomingMessage;
      body: CRD.UserList;
    }>;
  }
}
