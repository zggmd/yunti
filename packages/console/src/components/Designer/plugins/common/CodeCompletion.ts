import { project } from '@alilc/lowcode-engine';
import {
  IEditorInstance,
  IMonacoInstance,
} from '@alilc/lowcode-plugin-base-monaco-editor/lib/helper';
import { Monaco } from '@monaco-editor/loader';

const I18N_SEARCH_CHARACTER = '>';
interface RegisterCodeCompletion {
  monaco: IMonacoInstance | Monaco;
  editor?: IEditorInstance;
}

const getI18nList = () => {
  const i18n = project?.exportSchema()?.i18n;
  const i18nList = Object.keys(i18n?.['zh-CN'] || {})
    ?.map(key => ({
      zh: i18n?.['zh-CN']?.[key],
      en: i18n?.['en-US']?.[key],
      key,
    }))
    ?.sort((a, b) => a.zh?.localeCompare(b.zh));
  return i18nList;
};
// i18n 提示
export const registerI18nCodeCompletion = (props: RegisterCodeCompletion) => {
  const { monaco, editor } = props;
  const i18nList = getI18nList();

  // monaco.editor.registerCommand(
  //   "editor.suggest",
  //   (accessor, ...args) => {
  //   }
  // );
  monaco?.languages?.registerCompletionItemProvider('javascript', {
    triggerCharacters: ['(', I18N_SEARCH_CHARACTER],
    provideCompletionItems: (model, position) => {
      const codePre = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });
      const tag = codePre || '';
      if (!(tag + '').includes('this.i18n(')) {
        return;
      }
      const searchCode = codePre.slice(
        codePre.indexOf('(') + 1,
        codePre.indexOf(I18N_SEARCH_CHARACTER)
      );
      const word = model.getWordUntilPosition(position);
      let suggestions = (i18nList || [])?.filter(item =>
        searchCode ? item.zh.includes(searchCode) || item.key.includes(searchCode) : true
      );

      // 解决页面有多个编辑器实例时，提示重复的问题
      if (model?.uri?.toString() !== editor?.getModel()?.uri?.toString()) {
        suggestions = [];
      }
      return {
        suggestions: suggestions.map(i18n => ({
          label: `${i18n.zh} （${i18n.key}）`, // 默认显示中文
          detail: i18n.en,
          // filterText: "成功",
          // documentation: i18n.en,
          kind: monaco.languages.CompletionItemKind.EnumMember,
          insertText: `'${i18n.key}'`,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          },
          // command: {
          //   id: "editor.suggest",
          //   arguments: ['est1']
          // }
        })),
        dispose() {
          // 删除搜索文字
          const line = position.lineNumber;
          const column = position.column;
          const codePre =
            model.getValueInRange(new monaco.Range(line, 0, line, column)).trim() + '';
          if (!codePre.endsWith(I18N_SEARCH_CHARACTER)) {
            return;
          }
          // 解决页面有多个编辑器实例时，替换问题
          if (model?.uri?.toString() !== editor?.getModel()?.uri?.toString()) {
            return;
          }
          const index = codePre.split('').reverse().join('').indexOf('(');
          editor.executeEdits(I18N_SEARCH_CHARACTER, [
            {
              range: new monaco.Range(line, column - index, line, column),
              text: '',
              // identifier: { major: 1, minor: 1 },
              // forceMoveMarkers: true
            },
          ]);
        },
      };
    },
  });
};

// @todo
const registerComponentCodeCompletion = (props: RegisterCodeCompletion) => {
  const { monaco } = props;
  monaco?.languages?.typescript?.javascriptDefaults.addExtraLib(
    `
      declare class Component {
        state?: Record<string, any>;
        setState(input: Record<string, any>, fn?: (...args: any[]) => any): void;
        componentDidMount(): void;
        constructor(props: Record<string, any>, context: any);
        render(): void;
        componentDidUpdate(prevProps: Record<string, any>, prevState: Record<string, any>, snapshot: Record<string, any>): void;
        componentWillUnmount(): void;
        componentDidCatch(error: Error, info: any): void;
      }
  `,
    'ts:component.d.ts'
  );
};

const registerUtilsCodeCompletion = (props: RegisterCodeCompletion) => {
  const { monaco } = props;
  const utils = project
    ?.exportSchema()
    ?.utils?.map(item => ` const ${item.name} = ${item?.content?.value}`);
  monaco?.languages?.typescript?.javascriptDefaults?.addExtraLib(
    `declare module utils {
     ${utils.join('\n')}
    }
  `,
    'ts:utils.d.ts'
  );
};
const registerConstantsCodeCompletion = (props: RegisterCodeCompletion) => {
  const { monaco } = props;
  const contentsObj = project?.exportSchema()?.constants || {};
  const constants = Object.keys(contentsObj)?.map(
    key => `const ${key} = ${contentsObj?.[key]?.value} // ${contentsObj?.[key]?.description}`
  );
  monaco?.languages?.typescript?.javascriptDefaults?.addExtraLib(
    `declare module constants {
     ${constants.join('\n')}
    }
  `,
    'ts:constants.d.ts'
  );
};
export const registerCodeCompletion = (props: RegisterCodeCompletion) => {
  registerI18nCodeCompletion(props);
  registerUtilsCodeCompletion(props);
  registerConstantsCodeCompletion(props);
  // @todo
  // registerPropsCodeCompletion(props)
  // registerDataSourceMapCodeCompletion(props)
};
