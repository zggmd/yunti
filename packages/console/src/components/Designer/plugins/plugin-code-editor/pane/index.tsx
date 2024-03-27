import { Dialog, Message } from '@alifd/next';
import { common } from '@alilc/lowcode-engine';
import '@alilc/lowcode-plugin-base-monaco-editor/lib/style';
import { CssEditor, JsEditor } from '@alilc/lowcode-plugin-code-editor/es/components';
import { SaveIcon } from '@alilc/lowcode-plugin-code-editor/es/components/SaveIcon';
import { TAB_KEY, WORDS } from '@alilc/lowcode-plugin-code-editor/es/config';
import '@alilc/lowcode-plugin-code-editor/es/pane/index.less';
import { FunctionEventParams } from '@alilc/lowcode-plugin-code-editor/es/types';
import { Event, Project, Skeleton } from '@alilc/lowcode-shell';
import React, { memo, useEffect, useMemo, useRef, useState } from 'react';

import { registerCodeCompletion } from '../../common/CodeCompletion';
import { LIFE_CYCLES, METHODS_BLOCKED_KEYS, schema2CssCode, schema2JsCode } from '../utils';

interface CodeEditorPaneProps {
  project: Project;
  event: Event;
  skeleton: Skeleton;
  type?: 'Page' | 'Component';
}

export const CodeEditorPane = memo(({ project, event, skeleton, type }: CodeEditorPaneProps) => {
  const [activeKey, setActiveKey] = useState(TAB_KEY.JS);
  const lowcodeProjectRef = useRef(project);
  const skeletonRef = useRef(skeleton);
  const eventRef = useRef(event);
  const jsEditorRef = useRef<JsEditor>(null);
  const cssEditorRef = useRef<CssEditor>(null);
  const saveSchemaRef = useRef<() => void>(); // save code to schema

  const [schema, setSchema] = useState(() =>
    project.exportSchema(common.designerCabin.TransformStage.Save)
  );

  const jsCode = useMemo(() => {
    return schema2JsCode(schema, type);
  }, [schema]);

  const cssCode = useMemo(() => {
    return schema2CssCode(schema);
  }, [schema]);

  useEffect(() => {
    saveSchemaRef.current = () => {
      try {
        const currentSchema = lowcodeProjectRef.current?.exportSchema(
          common.designerCabin.TransformStage.Save
        );
        const pageNode = currentSchema.componentsTree[0];
        const {
          state,
          methods,
          lifeCycles,
          originCode = '',
        } = jsEditorRef.current?.getSchemaFromCode() ?? {};
        const css = cssEditorRef.current?.getBeautifiedCSS() ?? cssCode;
        pageNode.state = state;
        pageNode.methods = methods;
        pageNode.lifeCycles = lifeCycles;
        pageNode.originCode = originCode;

        if (
          Object.keys(methods || {}).some(methodKey => METHODS_BLOCKED_KEYS.includes(methodKey))
        ) {
          Dialog.alert({
            title: WORDS.title,
            content: (
              <>
                请尽量避免使用 <code>{METHODS_BLOCKED_KEYS.join(', ')}</code> 作为函数名，
                可能会与循环渲染中的内置变量名冲突
              </>
            ),
            onOk: () => {
              //
            },
          });
        }

        if (type === 'Component') {
          // @Todo 目前低代码组件的生命周期需要定义到 methods 中，否则无法执行
          // 相关 bug：https://github.com/alibaba/lowcode-engine/issues/1081#issuecomment-1257955293
          if (!pageNode.methods) {
            pageNode.methods = {};
          }
          if (!pageNode.lifeCycles) {
            pageNode.lifeCycles = {};
          }
          // 仅 merge 以下 4 个生命周期到 methods 中，constructor 及 render 不需要
          for (const lifeCycle of LIFE_CYCLES) {
            pageNode.methods[lifeCycle] = pageNode.lifeCycles[lifeCycle];
          }
        }

        pageNode.css = css;
        lowcodeProjectRef.current?.importSchema(currentSchema);

        setSchema(currentSchema);

        Message.success({
          content: WORDS.saveSuccess,
          duration: 1000,
        });
      } catch (error) {
        if (error instanceof Error) {
          Dialog.alert({
            title: WORDS.title,
            content: (
              <>
                {WORDS.generalParseError}
                <pre>{error.message}</pre>
              </>
            ),
            onOk: () => {
              skeletonRef.current?.showPanel('codeEditor');
            },
          });
        }
        // eslint-disable-next-line no-console
        console.error(error);
      }
    };
  }, [cssCode]);

  useEffect(() => {
    lowcodeProjectRef.current = project;
  }, [project]);

  useEffect(() => {
    skeletonRef.current = skeleton;
  }, [skeleton]);

  useEffect(() => {
    eventRef.current = event;
  }, [event]);

  useEffect(() => {
    // load schema on open
    skeletonRef.current?.onShowPanel((pluginName: string) => {
      if (pluginName === 'codeEditor') {
        const schema = lowcodeProjectRef.current?.exportSchema(
          common.designerCabin.TransformStage.Save
        );
        if (!schema) {
          return;
        }
        const jsCode = schema2JsCode(schema);
        const cssCode = schema2CssCode(schema);
        setSchema(schema);
        jsEditorRef.current?._updateCode(jsCode);
        cssEditorRef.current?._updateCode(cssCode);
      }
    });

    // save schema when panel closed
    skeletonRef.current?.onHidePanel((pluginName: string) => {
      if (pluginName === 'codeEditor') {
        saveSchemaRef.current?.();
      }
    });

    // focus function by functionName
    eventRef.current?.on('common:codeEditor.focusByFunction', params => {
      setActiveKey(TAB_KEY.JS);
      setTimeout(() => {
        jsEditorRef.current?.focusByFunctionName(params as FunctionEventParams);
      }, 100);
    });

    eventRef.current?.on('common:codeEditor.addFunction', params => {
      setActiveKey(TAB_KEY.JS);
      setTimeout(() => {
        jsEditorRef.current?.addFunction(params as FunctionEventParams);
      }, 100);
    });
    setTimeout(() => {
      const monaco = jsEditorRef?.current?.monaco;
      const editor = jsEditorRef?.current?.monacoEditor;
      monaco && registerCodeCompletion({ monaco, editor });
    }, 1000);
  }, []);

  return (
    <div className="plugin-code-editor-pane">
      <JsEditor
        currentTab={activeKey}
        jsCode={jsCode}
        onTabChange={key => setActiveKey(key as TAB_KEY)}
        ref={jsEditorRef}
      />
      <CssEditor
        cssCode={cssCode}
        currentTab={activeKey}
        onTabChange={key => setActiveKey(key as TAB_KEY)}
        ref={cssEditorRef}
      />
      <SaveIcon
        onClick={() => {
          saveSchemaRef.current?.();
        }}
        // isDisabled={code === jsCode || hasError}
      />
    </div>
  );
});

CodeEditorPane.displayName = 'LowcodeCodeEditor';
