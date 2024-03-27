import { Node, event } from '@alilc/lowcode-engine';
import { Alert, ConfigProvider, Form, Input, Modal, Select } from 'antd';
import { default as html2canvas } from 'html2canvas';
import * as React from 'react';
import ReactDOM from 'react-dom';

import { Block, CATEGORY_MAP as DEFAULT_CATEGORY_MAP, checkBlockAPI, getJsCode } from '../common';
import { Editor } from '../pane/JsEditor';
import styles from './index.less';

const MODAL_CLASS = 'tenx-ui-materials-modal';
const MODAL_CONTENT_CLASS = 'tenx-ui-materials-modal-content';

interface SaveAsBlockProps {
  node?: Node;
  block?: Block;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

export const SaveAsBlock = (props: SaveAsBlockProps) => {
  const { createBlock, listBlocks, updateBlock } = checkBlockAPI([
    'createBlock',
    'listBlocks',
    'updateBlock',
  ]);
  const { node, block } = props;
  const [src, setSrc] = React.useState<string>();
  const [open, setOpen] = React.useState(true || props.open);
  const [form] = Form.useForm();
  const [blocks, setBlocks] = React.useState([]);
  const [ignored, forceUpdate] = React.useReducer(x => x + 1, 0);
  const editorRef = React.useRef<any>(null);
  const CATEGORY_MAP = DEFAULT_CATEGORY_MAP.filter(item => item.id !== 'ALL');
  React.useEffect(() => {
    const generateImage = async () => {
      let dom = node.getDOMNode();
      if (dom?.getAttribute('class')?.includes(MODAL_CLASS)) {
        dom = dom.getElementsByClassName(MODAL_CONTENT_CLASS)[0];
      }
      const canvas = await html2canvas?.(dom);
      const dataUrl = canvas.toDataURL();
      setSrc(dataUrl);
    };

    node && generateImage();

    const getBlocks = async () => {
      const res = await listBlocks();
      setBlocks(res);
    };
    getBlocks();
  }, [listBlocks, node]);

  React.useEffect(() => {
    if (block) {
      form.setFieldsValue({
        ...block,
      });
      setSrc(block.screenshot);
    }
  }, [block, form]);

  const filterJsCode = (schema, callback) => {
    editorRef?.current?._updateCode(schema.jsCode);
    setTimeout(() => {
      const {
        state,
        methods,
        lifeCycles,
        originCode = '',
      } = editorRef.current?.getSchemaFromCode() ?? ({} as any);
      const stringSchema = JSON.stringify(schema.schema || {});
      for (const k of Object.keys(state || {})) {
        if (
          !stringSchema?.includes(`this.state.${k}`) &&
          !stringSchema?.includes(`this.state?.${k}`) &&
          !stringSchema?.includes(`this.state['${k}']`) &&
          !stringSchema?.includes(`this.state["${k}"]`)
        ) {
          delete state[k];
        }
      }
      for (const k of Object.keys(methods || {})) {
        if (!stringSchema?.includes(`this.${k}(`) && !stringSchema?.includes(`this.${k}.apply(`)) {
          delete methods[k];
        }
      }
      const result = [
        'class Page extends Component {\n  state = {',
        ...Object.keys(state || {}).map(k =>
          `    ${k}:${state[k].value},`.split('\n').join('\n    ')
        ),
        '  }',
        ...Object.keys(methods || {}).map(k =>
          `  ${methods[k]?.source?.slice(9)}`.split('\n').join('\n  ')
        ),
        '}',
      ].join('\n');
      callback(result);
    });
  };
  const save = async () => {
    form.validateFields().then(async values => {
      const { name, title, category } = values;
      const schema = {
        schema: block ? block.schema : node.schema,
        jsCode: block ? block.jsCode : getJsCode(),
        category,
      };

      const callback = async () => {
        // 编辑/替换
        const id = values.block || block?.id;
        if (id) {
          await updateBlock({
            name,
            title,
            schema: JSON.stringify(schema),
            screenshot: src,
            id,
            packages: block?.packages,
          });
          setOpen(false);
          event.emit('BlockChanged');
          props.setOpen && props.setOpen(false);
          return;
        }
        await createBlock({
          name,
          title,
          schema: JSON.stringify(schema),
          screenshot: src,
        });
        setOpen(false);
        event.emit('BlockChanged');
        props.setOpen && props.setOpen(false);
      };
      // 创建/替换
      if (!block) {
        filterJsCode(schema, jsCode => {
          schema.jsCode = jsCode;
          callback();
        });
        return;
      }
      callback();
    });
  };

  return (
    <ConfigProvider prefixCls="yunti">
      <Modal
        maskClosable={false}
        onCancel={() => {
          setOpen(false);
          props.setOpen && props.setOpen(false);
        }}
        onOk={save}
        open={open}
        title={`${block ? '编辑' : '保存为'}区块`}
      >
        <Form
          colon={false}
          form={form}
          labelAlign="left"
          labelCol={{ span: 4 }}
          style={{ paddingTop: 20 }}
        >
          <div style={{ display: 'none' }}>
            <Editor editorRef={editorRef} />
          </div>
          {!block && (
            <Alert
              banner
              message="注意：组件中绑定变量可能会导致组件不可用"
              showIcon
              style={{ marginBottom: 24 }}
              type="warning"
            />
          )}
          {!block && (
            <Form.Item label="替换区块" name="block">
              <Select
                allowClear
                filterOption={(input, option) => {
                  return (option?.children ?? '')?.includes(input);
                }}
                onChange={v => {
                  const { name, title, category } = blocks.find(block => block.id === v) || {};
                  form.setFieldsValue({
                    name,
                    title,
                    category,
                  });
                  forceUpdate();
                }}
                placeholder="请选择区块"
                showSearch
              >
                {blocks?.map(item => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}
          <Form.Item
            label="名称"
            name="name"
            required
            rules={[
              {
                validator: (_, value, callback) => {
                  if (!value) {
                    return callback('请输入名称');
                  }
                  if (
                    // 创建未选区块
                    (!block &&
                      !form.getFieldValue('block') &&
                      blocks.some(item => item.name === value)) ||
                    // 创建选区块
                    (!block &&
                      form.getFieldValue('block') &&
                      blocks.some(
                        item => item.name === value && item.id !== form.getFieldValue('block')
                      )) ||
                    // 编辑
                    (block && blocks.some(item => item.name === value && item.id !== block.id))
                  ) {
                    return callback('名称重复');
                  }
                  return callback();
                },
              },
            ]}
          >
            <Input placeholder="请输入名称" />
          </Form.Item>
          <Form.Item
            label="英文名"
            name="title"
            required
            rules={[
              {
                validator: (_, value, callback) => {
                  if (!value) {
                    return callback('请输入英文名');
                  }
                  if (
                    // 创建未选区块
                    (!block &&
                      !form.getFieldValue('block') &&
                      blocks.some(item => item.title === value)) ||
                    // 创建选区块
                    (!block &&
                      form.getFieldValue('block') &&
                      blocks.some(
                        item => item.title === value && item.id !== form.getFieldValue('block')
                      )) ||
                    // 编辑
                    (block && blocks.some(item => item.title === value && item.id !== block.id))
                  ) {
                    return callback('名称重复');
                  }
                  return callback();
                },
              },
            ]}
          >
            <Input placeholder="请输入英文名" />
          </Form.Item>
          <Form.Item
            initialValue={CATEGORY_MAP[0].id}
            label="分类"
            name="category"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="请选择分类">
              {CATEGORY_MAP.map(item => (
                <Select.Option key={item.id} value={item.id}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="缩略图" name="screenshot">
            <div className={styles['block-screenshot']}>
              <img src={src} />
            </div>
            <Input style={{ display: 'none' }} value={src} />
          </Form.Item>
        </Form>
      </Modal>
    </ConfigProvider>
  );
};

export default {
  name: 'add',
  content: {
    icon: {
      type: 'add',
      size: 'xs',
    },
    title: '新增',
    action(node: Node) {
      // console.log('node: ', node);
      const div = document.createElement('div');
      document.body.append(div);
      ReactDOM.render(<SaveAsBlock node={node} />, div);
    },
  },
  important: true,
};
