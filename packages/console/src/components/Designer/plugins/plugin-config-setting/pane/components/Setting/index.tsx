import MonacoEditor from '@alilc/lowcode-plugin-base-monaco-editor';
import { QuestionCircleOutlined } from '@ant-design/icons';
import {
  Anchor,
  Col,
  FloatButton,
  Form,
  FormItemProps,
  Row,
  Space,
  Tooltip,
  Typography,
} from 'antd';
import { AnchorLinkItemProps } from 'antd/es/anchor/Anchor';
import { Store } from 'antd/es/form/interface';
import { merge } from 'lodash';
import React, { useRef, useState } from 'react';

import styles from './index.less';

const { Paragraph, Link } = Typography;

export interface SettingItemProps {
  key: React.Key;
  title: React.ReactNode;
  link?: string;
  description?: string;
  formItem?: FormItemProps;
  children?: SettingItemProps[];
}

export interface SettingProps {
  items: SettingItemProps[];
  initialValues: Store;
  onChange?: (values: Store) => void;
  editor?: {
    enabled: boolean;
  };
}

const itemsToAnchorItems = (items: SettingItemProps[]) =>
  items.map(item => {
    const { key, title, children } = item;
    const anchorItem: AnchorLinkItemProps = {
      key,
      title,
      href: `#${item.key}`,
    };
    if (children) {
      anchorItem.children = itemsToAnchorItems(children);
    }
    return anchorItem;
  });

const renderItems = (items: SettingItemProps[], level: number) =>
  items.map(item => {
    const { key, title, link, description, formItem, children } = item;
    const TitleTag = `h${level > 5 ? 5 : level}`;
    return (
      <div className={styles.item} id={key as string} key={key}>
        {!formItem && (
          <>
            <Space>
              <div className={styles[TitleTag]}>{title}</div>
              {link && (
                <Tooltip title="点击查看详情">
                  <Link href={link} rel="noreferrer" target="_blank">
                    <QuestionCircleOutlined />
                  </Link>
                </Tooltip>
              )}
            </Space>
            <Paragraph type="secondary">{description}</Paragraph>
          </>
        )}
        {formItem && (
          <Form.Item
            {...formItem}
            label={formItem.label || title}
            tooltip={formItem.tooltip || description}
          />
        )}
        {children && renderItems(children, level + 1)}
      </div>
    );
  });

const Setting: React.FC<SettingProps> = ({
  items,
  initialValues,
  onChange,
  editor = { enabled: true },
}) => {
  const ref = useRef();
  const [form] = Form.useForm();
  const [editorValue, setEditorValue] = useState(JSON.stringify(initialValues, null, 2));
  const [editorMode, toggleEditorMode] = useState(false);

  const onValuesChange = (_: any, values: Store) => {
    // form 表单中只是部分配置，相当于是编辑器配置的子集，所以这里需要将表单值 merge 到编辑器的 value 中返回
    const newValues = merge(JSON.parse(editorValue), values);
    setEditorValue(JSON.stringify(newValues, null, 2));
    onChange?.(newValues);
  };

  const onCodeChange = (code: string) => {
    try {
      const newValues = JSON.parse(code);
      setEditorValue(code);
      form.setFieldsValue(newValues);
      onChange?.(newValues);
    } catch {
      //
    }
  };

  return (
    <Row className={`${styles.setting} config-setting-component`} ref={ref}>
      {!editorMode && (
        <>
          <Col flex="650px">
            <Form
              form={form}
              initialValues={initialValues}
              layout="vertical"
              onValuesChange={onValuesChange}
            >
              {renderItems(items, 2)}
            </Form>
          </Col>
          <Col className={styles.anchor} flex="160px">
            <Anchor
              getContainer={() => ref?.current}
              items={itemsToAnchorItems(items)}
              onClick={e => {
                e.preventDefault();
              }}
            />
          </Col>
        </>
      )}
      {editor?.enabled && (
        <>
          <Col flex="auto">
            {editorMode && (
              <MonacoEditor
                height="calc(100vh - 235px)"
                language="json"
                onChange={onCodeChange}
                supportFullScreen={true}
                value={editorValue}
              />
            )}
          </Col>
          <FloatButton
            className={styles.modeChangeBtn}
            onClick={() => toggleEditorMode(!editorMode)}
            target={() => ref?.current}
            tooltip={editorMode ? '切换为表单编辑' : '切换为配置文件编辑'}
            type="primary"
          />
        </>
      )}
    </Row>
  );
};

export default Setting;
