import { common, project } from '@alilc/lowcode-engine';
import { JsEditor } from '@alilc/lowcode-plugin-code-editor/es/components';
import { TAB_KEY } from '@alilc/lowcode-plugin-code-editor/es/config/tabs';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import {
  Alert,
  Checkbox,
  Collapse,
  Form,
  Input,
  Modal,
  Space,
  Typography,
  notification,
} from 'antd';
import * as React from 'react';

import { registerCodeCompletion } from '../../common/CodeCompletion';
import { Block, getBlockName, getJsCode } from '../common';
import styles from './index.less';

interface EditorProps {
  title: string;
  jsCode: string;
  editorRef: any;
}
export const Editor = (props: EditorProps) => {
  const { title, jsCode, editorRef } = props;
  React.useEffect(() => {
    setTimeout(() => {
      editorRef?.current?._updateCode(jsCode);
    });
  }, [jsCode, editorRef]);
  return (
    <div>
      <div>{title}</div>
      <JsEditor currentTab={TAB_KEY.JS} jsCode={jsCode} onTabChange={key => {}} ref={editorRef} />
    </div>
  );
};
interface EditorModalProps {
  block: Block;
  open: boolean;
  setOpen: (open: boolean) => void;
  updateDragonBlock?: any;
}
const EditorModal = (props: EditorModalProps) => {
  const { open, setOpen, block } = props;
  const [form] = Form.useForm();
  const blockJsEditorRef = React.useRef<JsEditor>();
  const jsEditorRef = React.useRef<JsEditor>();
  const [conflictState, setConflictState] = React.useState([]);
  const [conflictMethods, setConflictMethods] = React.useState([]);
  const [blockMethods, setBlockMethods] = React.useState([]);
  const [ignored, forceUpdate] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => {
    setTimeout(() => {
      for (const ref of [blockJsEditorRef, jsEditorRef]) {
        const monaco = ref?.current?.monaco;
        const editor = ref?.current?.monacoEditor;
        registerCodeCompletion({ monaco, editor });
      }
    }, 1000);
  }, []);
  const hasErr = Object.keys(form?.getFieldsValue() || {})?.some(
    key => key.startsWith('method=') && !form?.getFieldsValue()[key]
  );
  const jsCode = getJsCode();
  const blockJsCode = block?.jsCode;
  const replaceMethods = schema => {
    const values = form.getFieldsValue();
    const selectNodeSchemaString = JSON.stringify(
      project.currentDocument.selection.getTopNodes()?.[0]?.schema || {}
    );

    let newSchemaString = selectNodeSchemaString;
    for (const key of Object.keys(values)) {
      if (key.startsWith('method=')) {
        const method = key.split('=')[1];
        newSchemaString = newSchemaString
          .replace(`this.${method}(`, `this.${values[key]}(`)
          .replace(`this.${method}.apply(`, `this.${values[key]}.apply(`)
          .replace(`"relatedEventName":"${method}"`, `"relatedEventName":"${values[key]}"`);
      }
    }
    const schemaString = JSON.stringify(schema || {}).replace(
      selectNodeSchemaString,
      newSchemaString
    );
    schema = JSON.parse(schemaString);
    return schema;
  };
  const handleOk = () => {
    form.validateFields().then(values => {
      let currentSchema = project.exportSchema(common.designerCabin.TransformStage.Save);
      const pageNode = currentSchema.componentsTree[0] as any;
      const {
        state,
        methods,
        lifeCycles,
        originCode = '',
      } = jsEditorRef.current?.getSchemaFromCode() ?? {};
      pageNode.state = state;
      pageNode.methods = methods;
      pageNode.lifeCycles = lifeCycles;
      pageNode.originCode = originCode;
      if (values.replaceMethods) {
        currentSchema = replaceMethods(currentSchema);
      }
      project?.importSchema(currentSchema);
      notification.success({
        message: '合并成功',
      });
      setOpen(false);
    });
  };

  const checkSame = (incom, curr) => {
    const result = [];
    Object.keys(incom || {})?.forEach(bk => {
      if (Object.keys(curr || {})?.some(k => k === bk)) {
        result.push(bk);
      }
    });
    return result;
  };
  React.useEffect(() => {
    setTimeout(() => {
      const { state, methods } = jsEditorRef.current?.getSchemaFromCode() ?? ({} as any);
      const { state: blockState, methods: blockMethods } =
        blockJsEditorRef.current?.getSchemaFromCode() ?? ({} as any);
      const cState = checkSame(blockState, state);
      const cMethods = checkSame(blockMethods, methods);
      setConflictState(cState);
      setConflictMethods(cMethods);
      setBlockMethods(Object.keys(blockMethods || {}));
    }, 200);
  }, [jsCode, blockJsCode]);
  return (
    <Modal
      className={styles.Editor}
      destroyOnClose={true}
      onCancel={() => {
        setOpen(false);
      }}
      onOk={handleOk}
      open={open}
      title={`变量方法合并`}
      width={1224}
    >
      {conflictState?.length > 0 && (
        <Alert
          banner
          description={<Typography.Text copyable>{conflictState.join(', ')}</Typography.Text>}
          message="注意：当前页面以下【变量】已存在，注意重命名;  组件绑定【变量】需要同步修改"
          showIcon
          style={{ marginBottom: 24 }}
          type="warning"
        />
      )}
      {conflictMethods?.length > 0 && (
        <Alert
          banner
          description={<Typography.Text copyable>{conflictMethods.join(', ')}</Typography.Text>}
          message="注意：当前页面以下【方法】已存在，注意重命名;  组件绑定【方法】需要同步修改"
          showIcon
          style={{ marginBottom: 24 }}
          type="warning"
        />
      )}
      <Form
        colon={false}
        form={form}
        labelAlign="left"
        labelCol={{ span: 4 }}
        style={{ marginTop: 20 }}
      >
        {blockMethods?.length > 0 && (
          <Collapse
            items={[
              {
                key: 'replaceMethods',
                label: (
                  <Form.Item
                    name={`replaceMethods`}
                    style={{ marginBottom: 0 }}
                    valuePropName="checked"
                  >
                    <Checkbox>
                      <Space>
                        替换组件绑定【方法】
                        <Alert
                          banner
                          message="仅替换 this.方法名( ，this.方法名.apply(; 可能会存在遗漏"
                          showIcon
                          type="warning"
                        />
                        {hasErr && (
                          <Space style={{ color: 'red', position: 'absolute', right: 0, top: 10 }}>
                            <ExclamationCircleOutlined />
                            存在空字段
                          </Space>
                        )}
                      </Space>
                    </Checkbox>
                  </Form.Item>
                ),
                children: (
                  <>
                    {blockMethods?.map(key => (
                      <Form.Item
                        initialValue={key}
                        key={key}
                        label={key}
                        labelCol={{ span: 6 }}
                        name={`method=${key}`}
                        rules={[
                          {
                            validator: (_, value, callback) => {
                              if (!value) {
                                return callback('请输入方法名');
                              }
                              callback();
                            },
                          },
                        ]}
                        wrapperCol={{ span: 12 }}
                      >
                        <Input onChange={() => forceUpdate()} placeholder="请输入方法名" />
                      </Form.Item>
                    ))}
                  </>
                ),
              },
            ]}
            style={{ marginBottom: 20 }}
          />
        )}
        <Space>
          <Editor
            editorRef={blockJsEditorRef}
            jsCode={blockJsCode}
            title={`区块：${getBlockName(block)}`}
          />
          <Editor editorRef={jsEditorRef} jsCode={jsCode} title="当前页面" />
        </Space>
      </Form>
    </Modal>
  );
};
export const ShowModal = (props: EditorModalProps) => {
  const { setOpen, block, updateDragonBlock } = props;

  const blockJsEditorRef = React.useRef<JsEditor>();
  const blockJsCode = block?.jsCode;

  React.useEffect(() => {
    setTimeout(() => {
      if (!block) return;
      const { state: blockState, methods: blockMethods } =
        blockJsEditorRef.current?.getSchemaFromCode() ?? ({} as any);
      if (Object.keys(blockState || {})?.length || Object.keys(blockMethods || {})?.length) {
        setOpen(true);
      }
    }, 200);
  }, [blockJsCode, block, setOpen, updateDragonBlock]);
  return (
    <div style={{ display: 'none' }}>
      <Editor editorRef={blockJsEditorRef} jsCode={blockJsCode} title={``} />
    </div>
  );
};
export default EditorModal;
