import { K8s } from '@yuntijs/k8s-client/lib';
import { isObject } from 'lodash';
import { customAlphabet } from 'nanoid';
import { lowercase, numbers } from 'nanoid-dictionary';
import * as crypto from 'node:crypto';
import { readFileSync } from 'node:fs';
import * as semver from 'semver';
import { parse } from 'yaml';

import type { ILoginUser, Request } from '../../types';
import { MemberRole } from '../models/member-role.enum';
import { RELEASE_BRANCH_PREFIX, TREE_DEFAULT } from './constants';
import { CustomException } from './errors';

export const getConfigByPath = (configPath: string) => {
  const fileContent = readFileSync(configPath);
  return parse(fileContent.toString()) as Record<string, any>;
};

/**
 * 睡眠暂停函数
 * @param seconds 秒
 */
export const sleep = (seconds: number) =>
  new Promise(resolve => {
    setTimeout(resolve, seconds * 1000);
  });

/**
 * 获取随机字符串
 */
export const randomUUID = () => crypto.randomUUID();

/**
 * 判断是否都为 true
 * @param booleanList 布尔类型数组
 */
export const isAllTrue = (booleanList: boolean[]) => !booleanList.includes(false);

/**
 * 生成当前用户的日志字符串
 * @param req request 对象
 */
export const genUserLogString = (req: Request) => {
  const { session, ip = '-', __reqId, method, url, baseUrl, body } = req;
  const operationName = body?.operationName || '-';
  let userRoleIp = '';
  if (session?.loginUser) {
    const { name, role = 'N/A' } = session.loginUser;
    userRoleIp = `${name}(${role})@${ip}`;
  } else {
    userRoleIp = `N/A@${ip}`;
  }
  return `${userRoleIp} [${__reqId}] ${method} ${baseUrl || url} ${operationName}`;
};

export const nanoid = customAlphabet(numbers + lowercase, 5);

/**
 * 生成带前缀的短 id
 * @param {string} prefix 前缀
 * @returns
 */
export const genNanoid = (prefix: string) => `${prefix}-${nanoid()}`;

/**
 * Base64 转码 encode
 */
export const encodeBase64 = (value: string) => Buffer.from(value || '').toString('base64');

/**
 * Base64 转码 decode
 */
export const decodeBase64 = (value: string) => Buffer.from(value || '', 'base64').toString('utf-8');

/**
 * 首字母大写
 */
export const initialToUpperCase = (value: string) =>
  (value || '').replace(/^(\w)/, (_, $0) => $0.toUpperCase());

/**
 * 生成 es 配置的 key
 * @param clusterName 集群 name
 * @returns
 */
export const genClusterConfigsEsKey = (clusterName: string) => `es-${clusterName}`;

/**
 * 从 schema 中抽取 i18n，并在 callback 中返回 i18n 的 key 和 path
 * @param schema 模型
 * @param path 路径
 * @param callback 回调函数
 * @returns
 */
export const extractI18nKeyPathFromSchema = (
  schema: any = {},
  path: string[] = [],
  callback: (key: string, path: string[]) => void
) => {
  for (const [key, values] of Object.entries<any>(schema)) {
    if (!isObject(values as any)) {
      continue;
    }
    if (values.type === 'i18n' && values.key?.startsWith('i18n-')) {
      callback(values.key, [...path, key]);
    } else if (values.type === 'JSFunction' || values.type === 'JSExpression') {
      const i18nFromJSFunction = values.value?.match(/i18n\(["'|]i18n-[\d,a-z]+["'|]\)/g);
      if (i18nFromJSFunction?.length > 0) {
        i18nFromJSFunction.forEach((i18nString: string) => {
          const key = i18nString.replace(/^i18n\(["'|]/, '').replace(/["'|]\)$/, '');
          callback(key, [...path, key, 'value']);
        });
      }
    }
    extractI18nKeyPathFromSchema(values, [...path, key], callback);
  }
};

/**
 * 检查用户是否有操作 tree 的权限
 *
 * 用户对自己创建的分支拥有读写权限，对 main 分支和 release 分支拥有只读权限，
 * 应用的 Owner 和 Maintainer 拥有 main 分支和 release 分支的读写权限
 *
 * @param user 用户
 * @param tree 分支名
 * @param memberRole 用户在应用中的权限
 * @param id 应用、组件等的 Id
 * @returns 没有权限则抛出错误
 */
export const checkUserTreeMutationPermision = (
  user: ILoginUser,
  tree: string,
  memberRole: MemberRole,
  id: string
) => {
  // eslint-disable-next-line prefer-const
  let [_id, userId] = tree.split('/');
  if (_id !== TREE_DEFAULT && _id !== id) {
    throw new CustomException(
      'Forbidden',
      'Can only operate branches under the application/component',
      403,
      { tree, memberRole, id }
    );
  }
  if (_id === TREE_DEFAULT) {
    userId = TREE_DEFAULT;
  }
  if (userId === TREE_DEFAULT || userId.startsWith(RELEASE_BRANCH_PREFIX)) {
    if (memberRole !== MemberRole.Owner && memberRole !== MemberRole.Maintainer) {
      throw new CustomException(
        'Forbidden',
        'only Owner and Maintainer can update release branch',
        403,
        { tree, memberRole, id }
      );
    }
    return true;
  } else if (userId !== user.id) {
    throw new CustomException(
      'Forbidden',
      'can not update branch, because you have no permissions',
      403,
      { tree, memberRole, id }
    );
  }
  return true;
};

export const semverLt = (v1: string, v2: string) => {
  v1 = semver.valid(v1);
  v2 = semver.valid(v2);
  const validVersions = [v1, v2].filter(v => v !== null).length;
  if (validVersions === 2) {
    return semver.lt(v1, v2);
  }
  if (!v1) {
    return true;
  }
  return false;
};

export const semverMinVersion = (range: string) => {
  try {
    return semver.minVersion(range).version;
  } catch {
    return null;
  }
};

/**
 * 解析提取 PipelineRun 状态
 *
 * @param {K8s.V1JobCondition} statusCondition pr.status?.conditions?.[0]
 */
export const extractPipelineRunStatus = (statusCondition: K8s.V1JobCondition) => {
  const { status, message, reason } = statusCondition;
  const regex =
    /Completed: (\d+).*?Failed: (\d+).*?Cancelled (\d+)(.*?Incomplete: (\d+))?.*?Skipped: (\d+)/;
  const matches = message?.match(regex);

  if (!matches) {
    return { status, message, reason };
  }

  const [, completed, failed, cancelled, , incomplete = 0, skipped] = matches.map(val =>
    val ? Number.parseInt(val, 10) : 0
  );
  const total = failed + cancelled + incomplete + skipped + completed;
  return {
    status,
    reason,
    message,
    completed,
    failed,
    cancelled,
    incomplete,
    skipped,
    total,
  };
};
