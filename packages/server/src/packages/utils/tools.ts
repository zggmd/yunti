import { camelCase } from 'change-case';

import { SORTED_BY_DEPS_EXTERNALS } from './constants';
import { PACKAGE_LIBRARY_MAP } from './npm-libray-map';

/**
 * 根据 npm 包名称猜测 library 名
 * 先从已知的 map 中取，没有的话再以斜杠 '/' 分割取最后的 name 转为小驼峰
 *
 * @param {string} name npm 包名称
 * @return {string} library 全局变量名
 */
export const guessLibraryByPkgName = (name: string): string => {
  const library = PACKAGE_LIBRARY_MAP[name];
  if (library) {
    return library;
  }
  const namesArray = name.split('/');
  return camelCase(namesArray.at(-1));
};

/**
 * 按照依赖的先后顺序对包进行排序
 *
 * @template T
 * @param {T[]} packages 包列表
 * @param {string} key 包名所在 props 名称
 */
export const sortPackages = <T, K extends keyof T>(packages: T[], key: K) =>
  packages.sort((pA, pB) => {
    // @Todo: 需要根据组件的真实依赖顺序进行排序
    const pAname = pA[key] as string;
    const pBname = pB[key] as string;
    if (SORTED_BY_DEPS_EXTERNALS.includes(pAname) && SORTED_BY_DEPS_EXTERNALS.includes(pBname)) {
      return SORTED_BY_DEPS_EXTERNALS.indexOf(pAname) - SORTED_BY_DEPS_EXTERNALS.indexOf(pBname);
    }
    if (SORTED_BY_DEPS_EXTERNALS.includes(pAname)) {
      return -1;
    }
    if (SORTED_BY_DEPS_EXTERNALS.includes(pBname)) {
      return 1;
    }
    return pAname?.localeCompare(pBname);
  });
