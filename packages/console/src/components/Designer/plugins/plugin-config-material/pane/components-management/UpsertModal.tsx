import { IPublicTypeAssetsJson, IPublicTypeRemoteComponentDescription } from '@alilc/lowcode-types';
import { BuildOutlined, WalletOutlined } from '@ant-design/icons';
import FormHelper from '@tenx-ui/form-helper';
import { sdk } from '@tenx-ui/yunti-bff-client';
import { Form, Input, Modal, Radio, Select, Space, Typography } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';

import { LowCodePackage } from '@/components/Designer/type';

const { Link } = Typography;

export interface UpsertModalProps {
  open: boolean;
  mode?: 'update' | 'insert';
  initialValues?: IPublicTypeRemoteComponentDescription;
  onSave: (
    mode: UpsertModalProps['mode'],
    values: IPublicTypeRemoteComponentDescription,
    oldValues: IPublicTypeRemoteComponentDescription
  ) => Promise<void>;
  onCancel: () => void;
  assets?: IPublicTypeAssetsJson;
}

interface PackageItem {
  id: string;
  name?: string;
  /** npm 包版本 */
  version?: string;
  /** 低码组件版本列表 */
  versions?: string[];
  exportName?: string;
  disabled?: boolean;
  meta?: string;
}

const formatAndSortPkgs = (pacakges: PackageItem[], assets?: IPublicTypeAssetsJson) =>
  pacakges
    ?.map(pkg => {
      if (assets?.components?.some(cmp => pkg.id === cmp.reference?.id)) {
        pkg.disabled = true;
      }
      return pkg;
    })
    .sort((a, b) => {
      if (a.disabled === b.disabled) {
        return 0; // 保持原有顺序
      }
      if (a.disabled === false) {
        return -1; // a 在前面
      }
      return 1; // b 在前面
    }) || [];

/** 集更新 (update) 和添加 (insert) 为一体的 Modal */
const UpsertModal: React.FC<UpsertModalProps> = ({
  open,
  mode = 'insert',
  initialValues,
  onSave,
  onCancel,
  assets,
}) => {
  const [form] = Form.useForm<IPublicTypeRemoteComponentDescription>();
  const [confirmLoading, setConfirmLoading] = useState(false);
  useEffect(() => {
    if (!open) {
      return;
    }
    if (initialValues) {
      if (!initialValues.devMode) {
        initialValues.devMode = 'proCode';
      }
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [form, initialValues, open]);

  const devMode = Form.useWatch('devMode', form);
  const referenceId = Form.useWatch(['reference', 'id'], form);

  const npmPkgs = useMemo(
    () =>
      formatAndSortPkgs(
        (assets?.packages as unknown as LowCodePackage[])
          ?.filter(pkg => pkg.type?.toLowerCase() !== 'lowcode')
          .map(pkg => ({
            id: pkg.package || pkg.id,
            version: pkg.version || 'latest',
            exportName: pkg.meta?.exportName || (pkg.library && `${pkg.library}Meta`),
            meta: pkg.meta?.url,
            disabled: false,
          })),
        assets
      ),
    [assets]
  );

  // @Todo 应该拉取整个组件列表，不仅仅是自己开发的组件
  const { data: lccData, loading: lccLoading } = sdk.useGetCurrentUserComponentsWithVersions();
  const lccList = useMemo(
    () =>
      formatAndSortPkgs(
        lccData?.currentUser?.components
          .filter(cm => cm.versions?.length > 0)
          .map(cm => ({
            id: cm.id,
            name: cm.name,
            versions: cm.versions.map(({ version }) => version),
          })),
        assets
      ),
    [assets, lccData?.currentUser?.components]
  );
  const lccVersions = useMemo(() => {
    const targetLcc = lccList.find(lcc => lcc.id === referenceId);
    return targetLcc?.versions || [];
  }, [lccList, referenceId]);
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
      title={`${mode === 'insert' ? '添加' : '编辑'}组件`}
      width={640}
    >
      <FormHelper>
        <Form form={form} layout="vertical" name="upsert_component_modal">
          <Form.Item
            initialValue="proCode"
            name="devMode"
            rules={[{ required: true, message: '请选择组件类型' }]}
            style={{ textAlign: 'center' }}
          >
            <Radio.Group disabled={mode === 'update'}>
              <Radio.Button value="proCode">
                <Space>
                  <WalletOutlined />
                  <span>npm 组件</span>
                </Space>
              </Radio.Button>
              <Radio.Button value="lowCode">
                <Space>
                  <BuildOutlined />
                  <span>低码组件</span>
                </Space>
              </Radio.Button>
            </Radio.Group>
          </Form.Item>
          {devMode === 'proCode' ? (
            <>
              <Form.Item
                label="npm 包"
                name={['reference', 'id']}
                rules={[{ required: true, message: '请选择 npm 包' }]}
                tooltip="可以在 “包管理” tab 中更改"
              >
                <Select
                  disabled={mode === 'update'}
                  onSelect={pkg => {
                    const targetPkg = npmPkgs.find(p => p.id === pkg);
                    form.setFieldValue(['reference', 'version'], targetPkg.version);
                    form.setFieldValue('exportName', targetPkg.exportName);
                    form.setFieldValue('url', targetPkg.meta);
                  }}
                  placeholder="请选择 npm 包"
                  showSearch
                >
                  {npmPkgs.map(({ id, version, disabled }) => (
                    <Select.Option disabled={disabled} key={id}>
                      {id}@{version}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label="组件低码描述文件地址"
                name="url"
                rules={[{ required: true, message: '请填写组件低码描述文件地址' }]}
                tooltip={
                  <div>
                    这里需要的是 npm
                    组件对应的低代码描述，也就是在低码编辑器中可以设置这个组件的哪些属性，详见
                    <Link
                      href="https://lowcode-engine.cn/site/docs/guide/expand/editor/material#%E7%89%A9%E6%96%99%E7%9A%84%E4%BD%8E%E4%BB%A3%E7%A0%81%E5%BC%80%E5%8F%91"
                      rel="noreferrer"
                      target="_blank"
                    >
                      物料扩展说明
                    </Link>
                  </div>
                }
              >
                <Input placeholder="请输入组件低码描述文件地址" />
              </Form.Item>
              <Form.Item
                label="组件低码描述导出名称"
                name="exportName"
                rules={[{ required: true, message: '请填写组件低码描述导出名称' }]}
              >
                <Input placeholder="请输入组件低码描述导出名称" />
              </Form.Item>
              <Form.Item hidden label="包版本" name={['reference', 'version']} />
            </>
          ) : (
            <>
              <Form.Item
                label="低码组件"
                name={['reference', 'id']}
                rules={[{ required: true, message: '请选择低码组件' }]}
                tooltip="可以在组件中开发和维护"
              >
                <Select
                  disabled={mode === 'update'}
                  loading={lccLoading}
                  onSelect={cmp => {
                    const targetCmp = lccList.find(p => p.id === cmp);
                    form.setFieldValue(['reference', 'version']);
                    form.setFieldValue(['reference', 'name'], targetCmp.name);
                  }}
                  placeholder="请选择低码组件"
                  showSearch
                >
                  {lccList.map(({ name, id, disabled }) => (
                    <Select.Option disabled={disabled} key={id}>
                      {name}({id})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                dependencies={[['reference', 'id']]}
                label="版本"
                name={['reference', 'version']}
              >
                <Select placeholder="请选择低码组件版本" showSearch>
                  {lccVersions.map(version => (
                    <Select.Option key={version}>{version}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item hidden label="低码组件名称" name={['reference', 'name']} />
            </>
          )}
        </Form>
      </FormHelper>
    </Modal>
  );
};

export default UpsertModal;
