import { message } from 'antd';

import { notification } from '@tenx-ui/materials';

import { getAuthData, setAuthData, removeAuthData, isTokenExpired } from '@tenx-ui/auth-utils';

import { sdk as bff, initSdkWithHooks, errorsHandler } from '@tenx-ui/yunti-bff-client';

import moment from 'moment';

import { sdk as u4aBff } from '@tenx-ui/bff-client';

import { debounce } from 'lodash';

import _dayjs from 'dayjs';

import dayjsRelativeTime from 'dayjs/plugin/relativeTime';

import { isURL as isUrl } from 'validator';

import { createRef } from 'react';

const utils = {};

utils.message = message;

utils.notification = notification;

utils.getAuthData = getAuthData;

utils.setAuthData = setAuthData;

utils.removeAuthData = removeAuthData;

utils.isTokenExpired = isTokenExpired;

/** 获取 Authorization header */
utils.getAuthorization = function __getAuthorization() {
  return () => {
    const authData = this.getAuthData();
    const { token_type, id_token } = authData.token || {};
    const Authorization = token_type && id_token && `${token_type} ${id_token}`;
    return Authorization;
  };
}.apply(utils);
export const getAuthorization = utils.getAuthorization;

/** 获取 axios 默认配置，也可在配置中指定拦截器，用于数据源初始化 axios handler */
utils.getAxiosHanlderConfig = function __getAxiosHanlderConfig() {
  return () => ({
    // 详细配置见：http://dev-npm.tenxcloud.net/-/web/detail/@yunti/lowcode-datasource-axios-handler
    interceptors: {
      request: [
        {
          onFulfilled: config => {
            if (!config.headers.get('Authorization')) {
              config.headers.set('Authorization', this.getAuthorization());
            }
            return config;
          },
        },
      ],
    },
  });
}.apply(utils);
export const getAxiosHanlderConfig = utils.getAxiosHanlderConfig;

utils.bff = bff;

utils.moment = moment;

/** 睡眠函数 */
utils.sleep = function __sleep() {
  return ms => new Promise(resolve => setTimeout(resolve, ms));
}.apply(utils);
export const sleep = utils.sleep;

utils.initSdkWithHooks = initSdkWithHooks;

/** 根据 id prefix 获取当前 tree */
utils.getTreeById = function __getTreeById() {
  return id => {
    if (!id) {
      return null;
    }
    const TREES_KEY = 'yunti_trees';
    try {
      const trees = JSON.parse(
        window.sessionStorage.getItem(TREES_KEY) || window.localStorage.getItem(TREES_KEY) || '{}'
      );
      return trees?.[id] || `${id}/main`;
    } catch (error) {
      return null;
    }
  };
}.apply(utils);
export const getTreeById = utils.getTreeById;

/** 根据 id prefix 获取 sdk */
utils.getSdkById = function __getSdkById() {
  return id => {
    const responseMiddleware = response => {
      const errors = response.errors || response.response?.errors;
      if (errors) {
        this.errorsHandler(errors);
      }
    };
    const tree = this.getTreeById(id);
    return this.initSdkWithHooks({
      tree,
      requestConfig: {
        responseMiddleware,
      },
    });
  };
}.apply(utils);
export const getSdkById = utils.getSdkById;

utils.errorsHandler = errorsHandler;

utils.u4aBff = u4aBff;

/** 获取发布应用的发布基线列表 */
utils.getPublishType = function __getPublishType() {
  return (pageThis, type = 'default') => {
    const { textKey, valueKey } = {
      default: {
        textKey: 'text',
        valueKey: 'value',
      },
      status: {
        textKey: 'children',
        valueKey: 'id',
      },
      options: {
        textKey: 'label',
        valueKey: 'value',
      },
    }[type];
    return [
      {
        [valueKey]: 'Branch',
        type: 'primary',
        [textKey]: 'Branch',
      },
      {
        [valueKey]: 'CommitId',
        type: 'error',
        [textKey]: 'CommitId',
      },
      {
        [valueKey]: 'Tag',
        type: 'error',
        [textKey]: 'Tag(敬请期待)',
        disabled: true,
      },
    ];
  };
}.apply(utils);
export const getPublishType = utils.getPublishType;

/** 获取应用发布状态 */
utils.getPublishStatus = function __getPublishStatus() {
  return (pageThis, type = 'default') => {
    const { textKey, valueKey } = {
      default: {
        textKey: 'text',
        valueKey: 'value',
      },
      status: {
        textKey: 'children',
        valueKey: 'id',
      },
      options: {
        textKey: 'label',
        valueKey: 'value',
      },
    }[type];
    return [
      {
        [valueKey]: 'Running', // 发布中
        type: 'primary',
        [textKey]: pageThis.i18n('i18n-dvhhy4bz'),
        color: '#00B96B',
      },
      {
        [valueKey]: 'Done', // 成功
        type: 'success',
        [textKey]: pageThis.i18n('i18n-w5yp1cx8'),
        color: '#52c41a',
      },
      {
        [valueKey]: 'Failed', // 失败
        type: 'error',
        [textKey]: pageThis.i18n('i18n-o8oudbt6'),
        color: '#ff7875',
      },
    ];
  };
}.apply(utils);
export const getPublishStatus = utils.getPublishStatus;

/** 获取渠道（组件仓库）状态 */
utils.getChannelStatus = function __getChannelStatus() {
  return (pageThis, type = 'default') => {
    const { textKey, valueKey } = {
      default: {
        textKey: 'text',
        valueKey: 'value',
      },
      status: {
        textKey: 'children',
        valueKey: 'id',
      },
      options: {
        textKey: 'label',
        valueKey: 'value',
      },
    }[type];
    return [
      {
        [valueKey]: 'Healthy', // 健康
        type: 'success',
        [textKey]: pageThis.i18n('i18n-1t6r3z9g'),
      },
      {
        [valueKey]: 'Abnormal', // 异常
        type: 'error',
        [textKey]: pageThis.i18n('i18n-1nuuys6g'),
      },
    ];
  };
}.apply(utils);
export const getChannelStatus = utils.getChannelStatus;

/** base64 加密 */
utils.encodeBase64 = function __encodeBase64() {
  return str => btoa(encodeURIComponent(str));
}.apply(utils);
export const encodeBase64 = utils.encodeBase64;

/** base64 解码 */
utils.decodeBase64 = function __decodeBase64() {
  return str => decodeURIComponent(atob(str));
}.apply(utils);
export const decodeBase64 = utils.decodeBase64;

utils.debounce = debounce;

utils._dayjs = _dayjs;

utils.dayjsRelativeTime = dayjsRelativeTime;

/** 修改地址栏参数 */
utils.changeLocationQuery = function __changeLocationQuery() {
  return (pageThis, func, _search) => {
    try {
      const locationSearch = {};
      const help = pageThis.appHelper;
      help?.location?.search
        ?.slice(1)
        ?.split('&')
        ?.forEach(item => {
          if (item.split('=')[0] === '_search') {
            locationSearch[item.split('=')[0]] = JSON.parse(decodeURI(item.split('=')[1]) || '{}');
          } else {
            locationSearch[item.split('=')[0]] = item.split('=')[1];
          }
        });
      const newQuery = {
        ...(locationSearch || {}),
        _search: JSON.stringify({
          ...((locationSearch || {})?._search || {}),
          ...(_search || {}),
        }),
      };
      const path =
        help?.match?.pathname +
        '?' +
        Object.keys(newQuery || {})
          ?.filter(key => key && newQuery[key])
          ?.map(key => `${key}=${newQuery[key]}`)
          ?.join('&');
      help.history?.replace(path);
    } catch (e) {}
  };
}.apply(utils);
export const changeLocationQuery = utils.changeLocationQuery;

/** dayjs */
utils.dayjs = function __dayjs() {
  return () => this._dayjs.extend(this.dayjsRelativeTime);
}.apply(utils);
export const dayjs = utils.dayjs;

utils.isUrl = isUrl;

/** 将 JSON 对象按照 key 顺序排序 */
utils.collectionSortKeys = function collectionSortKeys(value, isDeep = true) {
  /**
   * @name objectKeys
   * @param {Object} object
   * @returns {Array.<string>}
   */
  function objectKeys(object) {
    return Object.keys(object).sort((alpha, beta) => alpha.localeCompare(beta));
  }

  /**
   * name isObjectLike
   * @param {*} value
   * @returns {boolean}
   */
  function isObjectLike(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  if (!isObjectLike(value)) {
    if (Array.isArray(value)) {
      return value.map(arrayValue => collectionSortKeys(arrayValue, isDeep));
    }
    return value;
  }
  const keys = objectKeys(value);
  if (!keys.length) {
    return value;
  }
  return keys.reduce((sorted, key) => {
    if (isDeep && isObjectLike(value[key])) {
      sorted[key] = collectionSortKeys(value[key], isDeep);
    } else if (isDeep && Array.isArray(value[key])) {
      sorted[key] = collectionSortKeys(value[key], isDeep);
    } else {
      sorted[key] = value[key];
    }
    return sorted;
  }, {});
}.bind(utils);
export const collectionSortKeys = utils.collectionSortKeys;

export class RefsManager {
  constructor() {
    this.refInsStore = {};
  }

  clearNullRefs() {
    Object.keys(this.refInsStore).forEach(refName => {
      const filteredInsList = this.refInsStore[refName].filter(insRef => !!insRef.current);
      if (filteredInsList.length > 0) {
        this.refInsStore[refName] = filteredInsList;
      } else {
        delete this.refInsStore[refName];
      }
    });
  }

  get(refName) {
    this.clearNullRefs();
    if (this.refInsStore[refName] && this.refInsStore[refName].length > 0) {
      return this.refInsStore[refName][0].current;
    }

    return null;
  }

  getAll(refName) {
    this.clearNullRefs();
    if (this.refInsStore[refName] && this.refInsStore[refName].length > 0) {
      return this.refInsStore[refName].map(i => i.current);
    }

    return [];
  }

  linkRef(refName) {
    const refIns = createRef();
    this.refInsStore[refName] = this.refInsStore[refName] || [];
    this.refInsStore[refName].push(refIns);
    return refIns;
  }
}
utils.RefsManager = RefsManager;

/** 根据 id prefix 获取 sdk */
utils.setTree = function __setTree() {
  return (id, tree, sessionOnly = false) => {
    const TREES_KEY = 'yunti_trees';
    const trees = JSON.parse(
      window.sessionStorage.getItem(TREES_KEY) || window.localStorage.getItem(TREES_KEY) || '{}'
    );

    trees[id] = tree;
    window.sessionStorage.setItem(TREES_KEY, JSON.stringify(trees));
    !sessionOnly && window.localStorage.setItem(TREES_KEY, JSON.stringify(trees));
    return tree;
  };
}.apply(utils);
export const setTree = utils.setTree;

export default {
  bff,

  message,

  notification,

  getAuthData,

  setAuthData,

  removeAuthData,

  isTokenExpired,

  getAuthorization,

  getAxiosHanlderConfig,

  bff,

  moment,

  sleep,

  initSdkWithHooks,

  getTreeById,

  getSdkById,

  errorsHandler,

  u4aBff,

  setTree,

  getPublishType,

  getPublishStatus,

  getChannelStatus,

  encodeBase64,

  decodeBase64,

  debounce,

  _dayjs,

  dayjsRelativeTime,

  changeLocationQuery,

  dayjs,

  isUrl,

  collectionSortKeys,
};
