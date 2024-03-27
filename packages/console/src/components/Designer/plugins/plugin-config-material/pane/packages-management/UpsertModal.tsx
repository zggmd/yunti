import { IPublicTypeAssetsJson } from '@alilc/lowcode-types';
import { DeleteOutlined, LinkOutlined, PlusOutlined, RobotOutlined } from '@ant-design/icons';
import FormHelper from '@tenx-ui/form-helper';
import { GetPackageDetailQuery, sdk } from '@tenx-ui/yunti-bff-client';
import {
  Alert,
  Button,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Tooltip,
  Typography,
} from 'antd';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { LowCodePackage, PaneInjectProps } from '@/components/Designer/type';

const { Paragraph } = Typography;

export interface UpsertModalProps extends Pick<PaneInjectProps, 'id' | 'tree'> {
  open: boolean;
  mode?: 'update' | 'insert';
  initialValues?: LowCodePackage;
  onSave: (
    mode: UpsertModalProps['mode'],
    values: LowCodePackage,
    oldValues: LowCodePackage
  ) => Promise<void>;
  onCancel: () => void;
  assets?: IPublicTypeAssetsJson;
}

const OptionLoadingContent = (
  <Spin tip="努力加载中 ...">
    <div style={{ padding: '50px' }}></div>
  </Spin>
);

/** 集更新 (update) 和添加 (insert) 为一体的 Modal */
const UpsertModal: React.FC<UpsertModalProps> = ({
  id,
  tree,
  open,
  mode = 'insert',
  initialValues,
  onSave,
  onCancel,
  assets,
}) => {
  const [form] = Form.useForm<LowCodePackage>();
  const [confirmLoading, setConfirmLoading] = useState(false);

  const loadPkgDetail = useCallback(
    async (name: string) => {
      try {
        setPkgDetailLoading(true);
        const res = await sdk.getPackageDetail({ name, id, tree });
        setPkgDetail(res.package);
        return res.package;
      } finally {
        setPkgDetailLoading(false);
      }
    },
    [id, tree]
  );

  const loadPkgDetailAndSetExternalsPkgs = useCallback(
    async (name: string) => {
      const detail = await loadPkgDetail(name);
      form.setFieldsValue({
        externalsPkgs: detail?.umd?.externalsPkgs,
      });
    },
    [form, loadPkgDetail]
  );

  useEffect(() => {
    if (!open) {
      return;
    }
    form.resetFields();
    if (initialValues) {
      loadPkgDetailAndSetExternalsPkgs(initialValues.package);
      form.setFieldsValue(initialValues);
    }
  }, [form, initialValues, loadPkgDetailAndSetExternalsPkgs, open]);

  const [keyword, setKeyword] = useState<string>();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setKeywordDebounce = useCallback(debounce(setKeyword, 500), []);

  const { data: packagesData, loading: packagesLoading } = sdk.useSearchPackages({
    keyword: keyword || '@tenx-ui/',
  });
  const packages = useMemo(
    () =>
      (packagesData?.packages || []).map(pkg => ({
        ...pkg,
        disabled:
          assets.components.some(c => c.reference?.id === pkg.name) ||
          assets.packages?.some(p => p.package === pkg.name),
      })),
    [assets.components, assets.packages, packagesData?.packages]
  );

  const packageName = Form.useWatch('package', form) || '';
  const [pkgDetail, setPkgDetail] = useState<GetPackageDetailQuery['package']>();
  const [pkgDetailLoading, setPkgDetailLoading] = useState(false);
  const [pkgUmdLoading, setPkgUmdLoading] = useState(false);

  const urls = Form.useWatch<string[]>('urls', form) || [''];
  const editUrls = Form.useWatch<string[]>('editUrls', form);
  const externalsPkgs = Form.useWatch<GetPackageDetailQuery['package']['umd']['externalsPkgs']>(
    'externalsPkgs',
    form
  );

  const setUmdFields = useCallback(
    (umd: GetPackageDetailQuery['package']['umd']) => {
      form.setFieldsValue({
        library: umd?.library,
        urls: umd?.urls,
        editUrls: umd?.editUrls,
        meta: umd?.meta,
        externalsPkgs: umd?.externalsPkgs,
      });
    },
    [form]
  );

  const onVersionSelect = useCallback(
    async (name: string, version: string, detail?: GetPackageDetailQuery['package']) => {
      if (detail?.version === version) {
        setUmdFields(detail.umd);
        return;
      }
      form.setFieldsValue({
        urls: [''],
        editUrls: undefined,
        meta: {},
      });
      try {
        setPkgUmdLoading(true);
        const pkgVersionDetail = await sdk.getPackageUmdConfig({ name, version, id, tree });
        setUmdFields(pkgVersionDetail?.package?.umd);
      } finally {
        setPkgUmdLoading(false);
      }
    },
    [form, id, setUmdFields, tree]
  );

  const handleVersionSelect = useCallback(
    async (version: string) => {
      await onVersionSelect(packageName, version, pkgDetail);
      // @Todo 这里需要处理 npm 包的 external 依赖
    },
    [onVersionSelect, packageName, pkgDetail]
  );

  const handlePackageSelect = useCallback(
    async (name: string) => {
      form.setFieldsValue({
        version: undefined,
        urls: [''],
        editUrls: undefined,
        library: undefined,
      });
      const detail = await loadPkgDetail(name);
      const version = detail?.version;
      form.setFieldsValue({
        version,
      });
      onVersionSelect(detail.name, version, detail);
    },
    [form, loadPkgDetail, onVersionSelect]
  );

  return (
    <Modal
      confirmLoading={confirmLoading}
      destroyOnClose
      onCancel={onCancel}
      onOk={async () => {
        setConfirmLoading(true);
        try {
          const values = await form.validateFields();
          await onSave(mode, values, initialValues);
        } catch (error) {
          setConfirmLoading(false);
          throw error;
        }
        setConfirmLoading(false);
        form.resetFields();
      }}
      open={open}
      title={`${mode === 'insert' ? '添加' : '编辑'} npm 包`}
      width={640}
    >
      <FormHelper>
        <Form form={form} layout="vertical" name="upsert_component_modal">
          <Form.Item
            label="npm 包"
            name="package"
            rules={[{ required: true, message: '请选择 npm 包' }]}
          >
            <Select
              defaultActiveFirstOption={false}
              filterOption={false}
              loading={packagesLoading}
              notFoundContent={packagesLoading ? OptionLoadingContent : undefined}
              onSearch={setKeywordDebounce}
              onSelect={handlePackageSelect}
              options={packages.map(({ name, disabled }) => ({
                label: name,
                value: name,
                disabled,
              }))}
              placeholder="请输入 npm 包名进行搜索"
              showSearch
            />
          </Form.Item>
          <Form.Item
            label="版本"
            name="version"
            rules={[{ required: true, message: '请选择版本' }]}
          >
            <Select
              loading={pkgDetailLoading}
              notFoundContent={pkgDetailLoading ? OptionLoadingContent : undefined}
              onSelect={handleVersionSelect}
              options={(pkgDetail?.versions || []).map(({ version }) => ({
                label: version,
                value: version,
              }))}
              placeholder="请选择版本"
              showSearch
            />
          </Form.Item>
          <Spin spinning={pkgDetailLoading || pkgUmdLoading} tip="加载配置中 ...">
            <Form.Item hidden label="当前包依赖的外部 npm 包" name="externalsPkgs" />
            {externalsPkgs?.length > 0 && (
              <Form.Item>
                <Alert
                  description={
                    <Paragraph>
                      以下 npm 包会被自动添加或更新:
                      <ul>
                        {externalsPkgs.map(({ name, version }) => (
                          <li key={name}>
                            {name}@{version}
                          </li>
                        ))}
                      </ul>
                    </Paragraph>
                  }
                  icon={<RobotOutlined />}
                  message="当前包依赖的外部 npm 包"
                  showIcon
                  type="info"
                />
              </Form.Item>
            )}
            <Form.Item
              label="全局变量名称"
              name="library"
              rules={[{ required: true, message: '请输入 npm 包的全局变量名称' }]}
              tooltip="npm 包通过 umd 方式加载到浏览器中，在 window 中注入的全局变量名称"
            >
              <Input placeholder="请输入 npm 包的全局变量名称" />
            </Form.Item>
            <Form.List
              initialValue={['']}
              name="urls"
              rules={[
                {
                  validator: async (_, _urls) => {
                    if (!_urls || _urls.length === 0) {
                      throw new Error('请至少填写一个地址');
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }, { errors }) => (
                <>
                  {fields.map((field, index) => (
                    <Form.Item
                      key={field.key}
                      label={index === 0 ? 'UMD 产物 CDN 地址' : ''}
                      required
                    >
                      <Row gutter={2}>
                        <Col span={21}>
                          <Form.Item
                            {...field}
                            noStyle
                            rules={[{ required: true, message: '请填写 npm 包 UMD 产物 CDN 地址' }]}
                          >
                            <Input.TextArea
                              placeholder="请填写 npm 包 UMD 产物 CDN 地址"
                              rows={1}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={3}>
                          <Space size="small">
                            <Tooltip title="查看文件内容">
                              <Button
                                disabled={!urls[index]}
                                href={urls[index]}
                                icon={<LinkOutlined />}
                                rel="noreferrer"
                                target="_blank"
                                type="link"
                              />
                            </Tooltip>
                            {fields.length > 1 ? (
                              <Button
                                icon={<DeleteOutlined />}
                                onClick={() => remove(field.name)}
                                type="dashed"
                              />
                            ) : null}
                          </Space>
                        </Col>
                      </Row>
                    </Form.Item>
                  ))}
                  <Form.Item>
                    <Row gutter={2}>
                      <Col span={21}>
                        <Button
                          icon={<PlusOutlined />}
                          onClick={() => add()}
                          style={{ width: '100%' }}
                          type="dashed"
                        >
                          添加 UMD 产物地址
                        </Button>
                      </Col>
                    </Row>
                    <Form.ErrorList errors={errors} />
                  </Form.Item>
                </>
              )}
            </Form.List>
            <Form.List name="editUrls">
              {(fields, { add, remove }, { errors }) => (
                <>
                  {fields.map((field, index) => (
                    <Form.Item
                      key={field.key}
                      label={index === 0 ? '编辑态 UMD 产物 CDN 地址' : ''}
                      required={false}
                    >
                      <Row gutter={2}>
                        <Col span={21}>
                          <Form.Item
                            {...field}
                            noStyle
                            rules={[
                              { required: true, message: '请填写 npm 包编辑态 UMD 产物 CDN 地址' },
                            ]}
                          >
                            <Input.TextArea
                              placeholder="请填写 npm 包编辑态 UMD 产物 CDN 地址"
                              rows={1}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={3}>
                          <Space>
                            <Tooltip title="查看文件内容">
                              <Button
                                disabled={!editUrls?.[index]}
                                href={editUrls?.[index]}
                                icon={<LinkOutlined />}
                                rel="noreferrer"
                                target="_blank"
                                type="link"
                              />
                            </Tooltip>
                            <Button
                              icon={<DeleteOutlined />}
                              onClick={() => remove(field.name)}
                              type="dashed"
                            />
                          </Space>
                        </Col>
                      </Row>
                    </Form.Item>
                  ))}
                  <Form.Item>
                    <Row gutter={2}>
                      <Col span={21}>
                        <Button
                          icon={<PlusOutlined />}
                          onClick={() => add()}
                          style={{ width: '100%' }}
                          type="dashed"
                        >
                          添加编辑态 UMD 产物地址
                        </Button>
                      </Col>
                    </Row>
                    <Form.ErrorList errors={errors} />
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Spin>
          <Form.Item hidden label="组件低码配置地址" name={['meta', 'url']} />
          <Form.Item hidden label="组件低码配置地址" name={['meta', 'exportName']} />
        </Form>
      </FormHelper>
    </Modal>
  );
};

export default UpsertModal;
