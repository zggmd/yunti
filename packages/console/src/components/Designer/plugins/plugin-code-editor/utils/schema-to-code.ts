// import { Dialog } from '@alifd/next';
import { IState } from '@alilc/lowcode-plugin-code-editor/es/types';
// import { WORDS } from '@alilc/lowcode-plugin-code-editor/es/config';
import type { Method } from '@alilc/lowcode-plugin-code-editor/es/types/methods';
import {
  IPublicTypeProjectSchema,
  IPublicTypeRootSchema,
  isJSExpression,
} from '@alilc/lowcode-types';
import { css_beautify, js_beautify } from 'js-beautify';

export const LIFE_CYCLES = [
  'componentDidMount',
  'componentDidUpdate',
  'componentWillUnmount',
  'componentDidCatch',
];

export const METHODS_BLOCKED_KEYS = ['index', 'item', 'text', 'record'];

const js_beautify_config = { indent_size: 2, indent_empty_lines: true, e4x: true };

const initCode = (
  componentSchema: IPublicTypeRootSchema | undefined,
  name: string,
  type: string
) => {
  const code = `class ${name} extends Component {
    ${initStateCode(componentSchema)}
    ${initLifeCycleCode(componentSchema, type)}
    ${initMethodsCode(componentSchema)}
  }`;

  return js_beautify(code, js_beautify_config);
};

export const schema2JsCode = (schema: IPublicTypeProjectSchema, type: string) => {
  const componentSchema = schema.componentsTree[0];
  const name = type === 'Component' ? 'LcComponent' : 'Page';
  const code = componentSchema?.originCode ?? initCode(componentSchema, name, type);

  // console.log('当前的code：', code);
  return code;
};

export const schema2CssCode = (schema: IPublicTypeProjectSchema) => {
  return beautifyCSS(schema.componentsTree[0]?.css);
};

export const beautifyCSS = (input?: string): string => {
  return input ? css_beautify(input, { indent_size: 2 }) : '';
};

function initStateCode(componentSchema: IPublicTypeRootSchema | undefined) {
  if (componentSchema?.state) {
    let statesStr = 'state = {\n';
    for (const key of Object.keys(componentSchema.state)) {
      const state = componentSchema.state?.[key];
      statesStr +=
        typeof state === 'object' && isJSExpression(state)
          ? `"${key}": ${(state as IState).source || state.value},\n`
          : `"${key}": ${typeof state === 'string' ? '"' + state + '"' : state},,\n`;
    }
    statesStr += '}';
    return statesStr;
  }
}

function initLifeCycleCode(componentSchema: IPublicTypeRootSchema | undefined, type: string) {
  if (componentSchema?.lifeCycles) {
    const { lifeCycles } = componentSchema;
    const codeList = [];

    for (const key in lifeCycles) {
      // 相关 bug：https://github.com/alibaba/lowcode-engine/issues/1081#issuecomment-1257955293
      // @Todo 目前低代码组件的生命周期需要定义到 methods 中，否则无法执行，但是在源码编辑器中可能会重复，
      // 这里做一下过滤
      if (type !== 'Component' || !LIFE_CYCLES.includes(key)) {
        codeList.push(createFunctionCode(key, lifeCycles[key]));
      }
    }

    return codeList.join('');
  } else {
    return '';
  }
}

function initMethodsCode(componentSchema: IPublicTypeRootSchema | undefined) {
  if (componentSchema?.methods && Object.keys(componentSchema.methods).length > 0) {
    const { methods } = componentSchema;
    const codeList = [];

    for (const key in methods) {
      if (Object.hasOwn(methods, key)) {
        codeList.push(createFunctionCode(key, methods[key]));
      }
    }

    return codeList.join('');
  } else {
    return `
      // 你可以在这里编写函数，并且与组件的事件进行绑定，支持JSX语法
      testFunc() {
        console.log('test aliLowcode func');
        return (
          <div className="test-aliLowcode-func">
        {this.state.test}
      </div>
        );
      }
    `;
  }
}

function createFunctionCode(functionName: string, functionNode: Method) {
  if (functionNode?.type === 'JSExpression' || functionNode?.type === 'JSFunction') {
    // 读取原始代码
    let functionCode = functionNode.source;
    if (functionCode) {
      functionCode = functionCode.replace(/function/, '');
    } else {
      // 兼容历史数据
      functionCode = functionNode.value?.replace(/function/, functionName);
    }
    return functionCode;
  }
}
