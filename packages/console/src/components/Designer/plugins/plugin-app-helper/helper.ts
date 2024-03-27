import { utils as lowcodeUtils } from '@alilc/lowcode-renderer-core';

export const pluginName = 'PluginConfigAppHelper';

export interface JSExpression {
  /** 类型 */
  type: 'JSExpression';
  /** 值 */
  value: string;
}

export interface JSFunction {
  /** 类型 */
  type: 'JSFunction';
  /** 值 */
  value: string;
}

export interface ComponentMap {
  /** 协议中的组件名，唯一性，对应包导出的组件名，是一个有效的 JS 标识符，而且是大写字母打头 */
  componentName: string;
  /** npm 公域的 package name */
  package: string;
  /** 版本 */
  version?: string;
  /** 使用解构方式对模块进行导出 */
  destructuring?: boolean;
  /** 包导出的组件名 */
  exportName: string;
  /** 下标子组件名称 */
  subName?: string;
  /** 包导出组件入口文件路径 */
  main?: string;
}
export interface ConstantsSchemaItem extends JSExpression {
  /** 模拟数据 */
  mock?: string;
  /** 描述 */
  description?: string;
  /** 是否为系统内置，若是，则不允许修改删除 */
  builtin?: boolean;
}

export interface ConstantsSchema {
  [key: string]: ConstantsSchemaItem;
}

export interface UtilsSchemaItem {
  /** 名称 */
  name: string;
  /** 描述 */
  description?: string;
  /** 类型 */
  type: 'npm' | 'function';
  /** 是否为系统内置，若是，则不允许修改删除 */
  builtin?: boolean;
  /** 具体内容 */
  content: ComponentMap | JSFunction;
}

export type UtilsSchema = UtilsSchemaItem[];

export const parseConstantsSchema = (constantsSchema: ConstantsSchema = {}) => {
  const constants: { [key: string]: any } = {};
  for (const key of Object.keys(constantsSchema)) {
    try {
      const jsExpression = { ...constantsSchema[key] };
      if (constantsSchema[key].mock) {
        jsExpression.value = constantsSchema[key].mock;
      }
      constants[key] = lowcodeUtils.parseThisRequiredExpression(jsExpression, constants);
    } catch (error) {
      console.warn(`parse constants '${key}' failed`, error);
    }
  }
  return constants;
};

export const parseUtilsSchema = (
  utilsSchema: UtilsSchema = [],
  libraryMap?: { [key: string]: string }
) => {
  const utils: { [key: string]: any } = {};
  for (const utilsItem of utilsSchema) {
    switch (utilsItem.type) {
      case 'function': {
        utils[utilsItem.name] = lowcodeUtils.parseThisRequiredExpression(utilsItem.content, utils);
        break;
      }
      case 'npm': {
        const content = utilsItem.content as ComponentMap;
        const library = libraryMap?.[content.package];
        if (library) {
          utils[utilsItem.name] = (window as any)[library];
          if (content.destructuring && content.exportName) {
            utils[utilsItem.name] = utils[utilsItem.name][content.exportName];
          }
          if (content.subName) {
            utils[utilsItem.name] = utils[utilsItem.name][content.subName];
          }
        }
        break;
      }
      default: {
        break;
      }
    }
  }
  return utils;
};

export const genUtilsCode = (content: ComponentMap) => {
  const { componentName, package: pkg, destructuring, exportName, subName, main } = content;
  let code = 'import ';
  let importComponentName = exportName;
  if (!subName && componentName !== exportName) {
    importComponentName = `${exportName} as ${componentName}`;
  }
  if (destructuring) {
    importComponentName = `{ ${importComponentName} }`;
  }
  code += `${importComponentName} from '${pkg}`;
  if (main) {
    code += main;
  }
  code += "'\n";
  if (subName) {
    code += `const ${componentName} = ${exportName}.${subName}\n`;
  }
  code += `export { ${componentName} }`;
  return code;
};
