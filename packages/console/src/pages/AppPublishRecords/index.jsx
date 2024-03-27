// 注意: 出码引擎注入的临时变量默认都以 "__$$" 开头，禁止在搭建的代码中直接访问。
// 例外：react 框架的导出名和各种组件名除外。
import React from 'react';

import {
  Page,
  Modal,
  Alert,
  Row,
  Col,
  Typography,
  Space,
  FormilyForm,
  FormilyFormItem,
  Tooltip,
  FormilyRadio,
  FormilySelect,
  FormilyInput,
  Card,
  Tabs,
  Button,
  Input,
  Table,
  Popover,
  Descriptions,
  Status,
  Progress,
} from '@tenx-ui/materials';

import {
  AntdIconQuestionCircleOutlined,
  AntdIconPlusOutlined,
  AntdIconReloadOutlined,
  AntdIconInfoCircleFilled,
} from '@tenx-ui/icon-materials';

import { useLocation, matchPath } from '@umijs/max';
import DataProvider from '../../components/DataProvider';
import qs from 'query-string';
import { getUnifiedHistory } from '@tenx-ui/utils/es/UnifiedLink/index.prod';

import utils, { RefsManager } from '../../utils/__utils';

import * as __$$i18n from '../../i18n';

import __$$constants from '../../__constants';

import './index.css';

class AppPublishRecords$$Page extends React.Component {
  get location() {
    return this.props.self?.location;
  }
  get match() {
    return this.props.self?.match;
  }
  get history() {
    return this.props.self?.history;
  }
  get appHelper() {
    return this.props.self?.appHelper;
  }

  _context = this;

  get constants() {
    return __$$constants || {};
  }

  constructor(props, context) {
    super(props);

    this.utils = utils;

    this._refsManager = new RefsManager();

    __$$i18n._inject2(this);

    this.state = {
      timer: undefined,
      pageId: undefined,
      record: undefined,
      modalOpen: false,
      modalType: 'addPublish',
      allRepoData: undefined,
      publishSize: 10,
      modalLoading: false,
      publishCurrent: 1,
      publishPagination: undefined,
      publishSearchValue: undefined,
    };
  }

  $ = refName => {
    return this._refsManager.get(refName);
  };

  $$ = refName => {
    return this._refsManager.getAll(refName);
  };

  getTags() {
    const { tags } = this.props.useGetApp?.data?.app || [];
    return tags?.map(item => ({
      label: item.name,
      value: item.hash,
    }));
  }

  openModal(type, payload) {
    const { record } = payload || {};
    const modalType = payload?.type || type;
    this.setState(
      {
        modalOpen: true,
        modalType,
        record,
      },
      () => {
        if (['addPublish'].includes(modalType)) {
          this.loadBrancheCommitIds();
        }
      }
    );
  }

  closeModal() {
    this.setState({
      modalOpen: false,
      modalLoading: false,
    });
  }

  getAppName() {
    const { name, namespace } = this.props.useGetApp?.data?.app || {};
    return `${name}（${namespace}）`;
  }

  getBranches() {
    const { branches } = this.props.useGetApp?.data?.app || [];
    return branches?.map(item => ({
      label: item.displayName,
      value: item.name,
    }));
  }

  getChannels() {
    const publishChannels = this.state.allRepoData || [];
    return publishChannels?.map(item => ({
      ...item,
      label: `${item.name || '-'}`,
      value: item.id,
    }));
  }

  onTabChange(v) {
    if (v === 'tab-item-2') {
      this.appHelper.history?.replace(`/apps/${this.match?.params?.appId}/publish-channels`);
    }
  }

  getChannelUrl() {
    const form = this.$('publish_app_form')?.formRef?.current?.form;
    const url = this.getChannels()?.find(item => item.value === form?.values?.channelId)?.detail
      ?.url;
    return url;
  }

  getTagCommits() {}

  getPublishData() {
    const data = this.props.useGetAppPublishRecords?.data?.app?.paginatedPublishRecords;
    // ?.filter(item => {
    //   return this.state.publishSearchValue ? item?.detail?.channel?.name?.includes(this.state.publishSearchValue) : true
    // })
    // ?.filter(item => {
    //   const { status, channelstatus } = this.state?.publishPagination?.filters || []
    //   const hasStatus = status?.length > 0 ? status.includes(item.status) : true
    //   const hasChannelStatus = channelstatus?.length > 0 ? channelstatus.includes(item?.detail?.channel?.status) : true
    //   return hasStatus && hasChannelStatus
    // })
    // ?.sort((a, b) => {
    //   if (this.state?.publishPagination?.sorter?.order !== "ascend") {
    //     return new Date(b.createAt).getTime() - new Date(a.createAt).getTime()
    //   }
    //   return new Date(a.createAt).getTime() - new Date(b.createAt).getTime()
    // })?.slice(
    //   (this.state.publishCurrent - 1)*10,
    //   this.state.publishCurrent * 10,
    // )
    return {
      data: data?.nodes || [],
      total: data?.totalCount || 0,
    };
  }

  getRowBaseline(record) {
    if (record?.baseline === 'Branch') {
      return `${record?.tree?.split('/')?.reverse()?.[0]}(${record.detail.commit.hash?.slice(
        0,
        8
      )})`;
    }
    if (record?.baseline === 'CommitId') {
      return record.detail.commit.hash?.slice(0, 8);
    }
    if (record?.baseline === 'Tag') {
      const tag = this.getTags()?.find(item => item.value === record?.tree);
      return `${tag?.label}(${record.detail.commit.hash?.slice(0, 8)})`;
    }
    return '-';
  }

  async loadAllRepoData() {
    const res = await this.utils.bff.getAppPublishChannels({
      id: this.match?.params?.appId,
    });
    this.setState({
      allRepoData: res?.app?.publishChannels,
    });
  }

  loadPublishData() {
    const { status } = this.state.publishPagination?.filters || {};
    const params = {
      id: this.match?.params?.appId,
      pubrOptions: {
        page: this.state.publishCurrent,
        pageSize: this.state.publishSize,
        filter: {},
      },
    };
    if (this.state.publishPagination?.sorter?.order) {
      params.pubrOptions.order = {
        // ascend descend
        createAt: this.state.publishPagination?.sorter?.order === 'ascend' ? 'ASC' : 'DESC',
      };
    }
    if (status?.length === 1) {
      if (!params.pubrOptions.filter) {
        params.pubrOptions.filter = {};
      }
      params.pubrOptions.filter.status = status?.[0];
    }
    if (this.state.publishSearchValue) {
      if (!params.pubrOptions.filter) {
        params.pubrOptions.filter = {};
      }
      params.pubrOptions.filter.q = this.state.publishSearchValue;
    }
    this.utils?.changeLocationQuery(this, 'useGetAppPublishRecords', params);
  }

  onChannelChange(v) {
    const channelUrl = this.getChannels()?.find(item => item.value === v)?.detail?.url;
    const form = this.$('publish_app_form')?.formRef?.current?.form;
    form.setValues({
      channelUrl,
    });
  }

  onBranchIdChange(v) {
    this.loadBrancheCommitIds(v);
  }

  canEditAppPublish() {
    const currentUser = this.props.useGetCurrentUser?.data?.currentUser;
    return (
      currentUser?.role === 'SystemAdmin' ||
      ['Owner', 'Maintainer'].includes(
        this.props.useGetApp?.data?.app?.members.find(m => (m.member.name = currentUser?.name))
          ?.role
      )
    );
  }

  async confirmAddPublish(e) {
    const form = this.$('publish_app_form')?.formRef?.current?.form;
    form.submit(async values => {
      const { name, namespace } = this.props.useGetApp?.data?.app || {};
      const publish = {
        appId: this.match?.params?.appId,
        baseline: values.baselineType,
        tree: {
          Branch: values?.baseline?.branchId,
          CommitId: values?.baseline?.commitId,
          Tag: values?.baseline?.tagId,
        }[values.baselineType],
        channelId: values.channelId,
        name: namespace,
        displayName: name,
        version: values.version,
        commitId: values?.baseline?.[`${values.baselineType}CommitId`],
      };
      this.setState({
        modalLoading: true,
      });
      try {
        await this.utils.bff.doPublish({
          publish,
        });
        this.closeModal();
        this.utils.notification.success({
          message: this.i18n('i18n-5sf2v33a'),
        });
        this.handleRefreshPublish();
      } catch (error) {
        this.setState({
          modalLoading: false,
        });
        this.utils.notification.warnings({
          message: this.i18n('i18n-j30tafiu'),
          errors: error?.response?.errors,
        });
      }
    });
  }

  initBranchCommits(data) {
    const form = this.$('publish_app_form')?.formRef?.current?.form;
    if (!form) {
      setTimeout(() => {
        this.initBranchCommits(data);
      }, 200);
      return;
    }
    form.setValues({
      baseline: {
        BranchCommitId: data?.[0]?.value,
      },
    });
    form.setFieldState('baseline.BranchCommitId', {
      dataSource: data,
    });
  }

  openAddPublishModal() {
    this.openModal('addPublish');
  }

  async confirmRemovePublish() {
    this.setState({
      modalLoading: true,
    });
    await this.utils.bff.deletePublishRecord({
      id: this.state.record?.id,
    });
    this.closeModal();
    this.utils.notification.success({
      message: this.i18n('i18n-q95aq41k'),
    });
    this.handleRefreshPublish();
  }

  handleRefreshPublish() {
    this.props.useGetAppPublishRecords.mutate();
  }

  async loadBrancheCommitIds(tree, q) {
    const res = await this.utils.bff.getAppCommits({
      id: this.match?.params?.appId,
      tree: tree || this.getBranches()?.[0]?.value,
      options: {
        q,
      },
    });
    // const dayjs = this.utils.dayjs.extend(this.utils.dayjsRelativeTime)
    const getFromNow = t =>
      this.utils
        .dayjs()(t ? new Date(t) : new Date())
        ?.fromNow();
    const commitOptions =
      res?.app?.commits?.nodes?.map(item => {
        return {
          label: (
            <div>
              <div>{item.hash?.slice(0, 8)}</div>
              <div title={`${item.message} @ ${getFromNow(item.date)}`}>
                {`${item.message} @ ${getFromNow(item.date)}`}
              </div>
            </div>
          ),
          value: item.hash,
        };
      }) || [];
    this.initBranchCommits(commitOptions);
  }

  onBranchCommitIdSearch(v) {
    const form = this.$('publish_app_form')?.formRef?.current?.form;
    const tree = form.values?.baseline?.branchId;
    if (this.state.timer) {
      clearTimeout(this.state.timer);
    }
    this.setState({
      timer: setTimeout(() => {
        v && this.loadBrancheCommitIds(tree, v);
      }, 600),
    });
  }

  async validatorPublishVersion(value) {
    const form = this.$('publish_app_form')?.formRef?.current?.form;
    if (value) {
      try {
        const res = await this.utils.bff.getPublishChannelHelmChart({
          id: form?.values?.channelId,
          chartName: this.props.useGetApp?.data?.app?.namespace,
          chartVersion: value,
        });
        if (res?.publishChannel?.detail?.chart) {
          return this.i18n('i18n-zupi1oqq');
        }
      } catch (error) {}
    }
  }

  handlePublishTableChange(pagination, filters, sorter, extra) {
    this.setState(
      {
        publishPagination: {
          pagination,
          filters,
          sorter,
        },
      },
      this.loadPublishData
    );
  }

  handlePublishPaginationChange(c, s) {
    this.setState(
      {
        publishSize: s,
        publishCurrent: c,
      },
      this.loadPublishData
    );
  }

  handlePublishSearvhValueChange(e) {
    this.setState(
      {
        publishSearchValue: e.target.value,
        publishCurrent: 1,
      },
      this.loadPublishData
    );
  }

  componentDidMount() {
    this.loadAllRepoData();
  }

  render() {
    const __$$context = this._context || this;
    const { state } = __$$context;
    return (
      <Page>
        <Modal
          mask={true}
          onOk={function () {
            return this.confirmRemovePublish.apply(
              this,
              Array.prototype.slice.call(arguments).concat([])
            );
          }.bind(this)}
          open={__$$eval(() => this.state.modalOpen && this.state.modalType === 'deletePublish')}
          title={this.i18n('i18n-uk1rth4d') /* 删除发布记录 */}
          centered={false}
          keyboard={true}
          onCancel={function () {
            return this.closeModal.apply(this, Array.prototype.slice.call(arguments).concat([]));
          }.bind(this)}
          forceRender={false}
          maskClosable={false}
          confirmLoading={__$$eval(() => this.state.modalLoading)}
          destroyOnClose={true}
          __component_name="Modal"
        >
          <Alert
            type="warning"
            message={
              <Row wrap={true} gutter={[0, 0]} __component_name="Row">
                <Col span={24} __component_name="Col">
                  <Typography.Text
                    style={{ fontSize: '' }}
                    strong={false}
                    disabled={false}
                    ellipsis={true}
                    __component_name="Typography.Text"
                  >
                    {this.i18n('i18n-5ozgrwse') /* 确定删除此条发布记录？ */}
                  </Typography.Text>
                </Col>
                <Col span={24} __component_name="Col">
                  <Space size={0} align="center" direction="horizontal" __component_name="Space">
                    <Typography.Text
                      style={{ fontSize: '' }}
                      strong={false}
                      disabled={false}
                      ellipsis={true}
                      __component_name="Typography.Text"
                    >
                      {this.i18n('i18n-59n3gmuw') /* 发布版本： */}
                    </Typography.Text>
                    <Typography.Text
                      style={{ fontSize: '' }}
                      strong={true}
                      disabled={false}
                      ellipsis={true}
                      __component_name="Typography.Text"
                    >
                      {__$$eval(() => this.state?.record?.version || '-')}
                    </Typography.Text>
                    <Typography.Text
                      style={{ fontSize: '' }}
                      strong={false}
                      disabled={false}
                      ellipsis={true}
                      __component_name="Typography.Text"
                    >
                      {this.i18n('i18n-ubf2zl9c') /* ，发布至仓库： */}
                    </Typography.Text>
                    <Typography.Text
                      style={{ fontSize: '' }}
                      strong={true}
                      disabled={false}
                      ellipsis={true}
                      __component_name="Typography.Text"
                    >
                      {__$$eval(() => this.state?.record?.detail?.channel?.name || '-')}
                    </Typography.Text>
                  </Space>
                </Col>
              </Row>
            }
            showIcon={true}
            __component_name="Alert"
          />
        </Modal>
        <Modal
          mask={true}
          onOk={function () {
            return this.confirmAddPublish.apply(
              this,
              Array.prototype.slice.call(arguments).concat([])
            );
          }.bind(this)}
          open={__$$eval(() => this.state.modalType === 'addPublish' && this.state.modalOpen)}
          style={{}}
          title={this.i18n('i18n-vmthidgk') /* 发布应用 */}
          width="720px"
          okType="primary"
          centered={false}
          keyboard={true}
          onCancel={function () {
            return this.closeModal.apply(this, Array.prototype.slice.call(arguments).concat([]));
          }.bind(this)}
          forceRender={false}
          maskClosable={false}
          confirmLoading={__$$eval(() => this.state.modalLoading)}
          destroyOnClose={true}
          __component_name="Modal"
        >
          <FormilyForm
            ref={this._refsManager.linkRef('publish_app_form')}
            componentProps={{
              colon: false,
              layout: 'horizontal',
              labelCol: 5,
              labelAlign: 'left',
              wrapperCol: 20,
            }}
            __component_name="FormilyForm"
          >
            <FormilyFormItem
              fieldProps={{
                name: 'publishname',
                title: (
                  <Space align="center" direction="horizontal" __component_name="Space">
                    <Typography.Text
                      style={{ fontSize: '' }}
                      strong={false}
                      disabled={false}
                      ellipsis={true}
                      __component_name="Typography.Text"
                    >
                      {this.i18n('i18n-q05eb4ej') /* 发布名称 */}
                    </Typography.Text>
                    <Tooltip
                      title={
                        this.i18n(
                          'i18n-5mgs0dts'
                        ) /* 应用该名称（命名空间），其中应用名称即发布到组件仓库后的组件名称 */
                      }
                      __component_name="Tooltip"
                    >
                      <AntdIconQuestionCircleOutlined __component_name="AntdIconQuestionCircleOutlined" />
                    </Tooltip>
                  </Space>
                ),
                'x-component': 'FormilyFormItem',
                'x-validator': [],
                _unsafe_MixedSetter_title_select: 'SlotSetter',
              }}
              componentProps={{ 'x-component-props': {} }}
              __component_name="FormilyFormItem"
            >
              <Typography.Text
                style={{ fontSize: '' }}
                strong={false}
                disabled={false}
                ellipsis={true}
                __component_name="Typography.Text"
              >
                {__$$eval(() => this.getAppName())}
              </Typography.Text>
            </FormilyFormItem>
            <FormilyRadio
              fieldProps={{
                enum: __$$eval(() => this.utils.getPublishType(this, 'options')),
                name: 'baselineType',
                title: this.i18n('i18n-uu6jp4fr') /* 发布基线 */,
                default: __$$eval(() => this.utils.getPublishType(this, 'options')?.[0]?.value),
                'x-validator': [],
                _unsafe_MixedSetter_enum_select: 'ExpressionSetter',
                _unsafe_MixedSetter_default_select: 'VariableSetter',
              }}
              componentProps={{
                'x-component-props': {
                  size: 'middle',
                  disabled: false,
                  buttonStyle: 'outline',
                  _sdkSwrGetFunc: {},
                },
              }}
              __component_name="FormilyRadio"
            />
            <FormilyFormItem
              style={{}}
              fieldProps={{
                name: 'baseline',
                title: (
                  <Row wrap={true} __component_name="Row">
                    <Col span={24} __component_name="Col" />
                  </Row>
                ),
                'x-component': 'FormilyFormItem',
                'x-validator': [],
                _unsafe_MixedSetter_title_select: 'SlotSetter',
              }}
              componentProps={{ 'x-component-props': {} }}
              __component_name="FormilyFormItem"
            >
              <Space align="center" direction="horizontal" __component_name="Space">
                <FormilySelect
                  style={{ width: '260px' }}
                  fieldProps={{
                    enum: __$$eval(() => this.getBranches()),
                    name: 'branchId',
                    default: __$$eval(() => this.getBranches()?.[0]?.value),
                    required: true,
                    'x-display': "{{$form.values.baselineType === 'Branch' ? 'visible': 'hidden'}}",
                    'x-validator': [],
                    _unsafe_MixedSetter_enum_select: 'ExpressionSetter',
                    _unsafe_MixedSetter_default_select: 'VariableSetter',
                  }}
                  componentProps={{
                    'x-component-props': {
                      disabled: false,
                      onChange: function () {
                        return this.onBranchIdChange.apply(
                          this,
                          Array.prototype.slice.call(arguments).concat([])
                        );
                      }.bind(this),
                      allowClear: false,
                      placeholder: this.i18n('i18n-wo5d5bsf') /* 请选择分支 */,
                      _sdkSwrGetFunc: {},
                    },
                  }}
                  __component_name="FormilySelect"
                />
                <FormilySelect
                  style={{ width: '260px' }}
                  fieldProps={{
                    enum: [],
                    name: 'BranchCommitId',
                    default: null,
                    required: false,
                    'x-display': "{{$form.values.baselineType === 'Branch' ? 'visible': 'hidden'}}",
                    'x-validator': [],
                    _unsafe_MixedSetter_enum_select: 'ArraySetter',
                    _unsafe_MixedSetter_default_select: 'VariableSetter',
                  }}
                  componentProps={{
                    'x-component-props': {
                      disabled: false,
                      onSearch: function () {
                        return this.onBranchCommitIdSearch.apply(
                          this,
                          Array.prototype.slice.call(arguments).concat([])
                        );
                      }.bind(this),
                      allowClear: false,
                      showSearch: true,
                      placeholder: this.i18n('i18n-qd0chypg') /* 请选择CommitId */,
                      _sdkSwrGetFunc: {},
                    },
                  }}
                  __component_name="FormilySelect"
                />
              </Space>
              <Space align="center" direction="horizontal" __component_name="Space">
                <FormilySelect
                  style={{ width: '260px' }}
                  fieldProps={{
                    enum: __$$eval(() => this.getTags()),
                    name: 'tagId',
                    default: __$$eval(() => this.getTags()?.[0]?.value),
                    required: true,
                    'x-display': "{{$form.values.baselineType === 'Tag' ? 'visible': 'hidden'}}",
                    'x-validator': [],
                    _unsafe_MixedSetter_enum_select: 'ExpressionSetter',
                    _unsafe_MixedSetter_default_select: 'VariableSetter',
                  }}
                  componentProps={{
                    'x-component-props': {
                      disabled: false,
                      allowClear: false,
                      placeholder: this.i18n('i18n-4guh56tw') /* 请选择标签 */,
                      _sdkSwrGetFunc: {},
                    },
                  }}
                  __component_name="FormilySelect"
                />
                <FormilySelect
                  style={{ width: '260px' }}
                  fieldProps={{
                    enum: __$$eval(() => this.getTagCommits()),
                    name: 'TagCommitId',
                    default: __$$eval(() => this.getTagCommits()?.[0]?.value),
                    required: true,
                    'x-display': "{{$form.values.baselineType === 'Tag' ? 'visible': 'hidden'}}",
                    'x-validator': [],
                    _unsafe_MixedSetter_enum_select: 'ExpressionSetter',
                    _unsafe_MixedSetter_default_select: 'VariableSetter',
                  }}
                  componentProps={{
                    'x-component-props': {
                      disabled: false,
                      allowClear: false,
                      placeholder: this.i18n('i18n-qd0chypg') /* 请选择CommitId */,
                      _sdkSwrGetFunc: {},
                    },
                  }}
                  __component_name="FormilySelect"
                />
              </Space>
              <Space align="center" direction="horizontal" __component_name="Space">
                <FormilyInput
                  style={{ width: '530px' }}
                  fieldProps={{
                    name: 'commitId',
                    title: '',
                    required: true,
                    'x-display':
                      "{{$form.values.baselineType === 'CommitId' ? 'visible': 'hidden'}}",
                    'x-validator': [],
                  }}
                  componentProps={{
                    'x-component-props': {
                      placeholder: this.i18n('i18n-sk0zlonj') /* 请输入 CommitId */,
                    },
                  }}
                  __component_name="FormilyInput"
                />
              </Space>
            </FormilyFormItem>
            <FormilySelect
              fieldProps={{
                enum: __$$eval(() => this.getChannels()),
                name: 'channelId',
                title: this.i18n('i18n-6ajtknut') /* 发布至仓库 */,
                default: __$$eval(() => this.getChannels()?.[0]?.value),
                required: true,
                'x-validator': [],
                _unsafe_MixedSetter_enum_select: 'ExpressionSetter',
                _unsafe_MixedSetter_default_select: 'VariableSetter',
              }}
              componentProps={{
                'x-component-props': {
                  disabled: false,
                  onChange: function () {
                    return this.onChannelChange.apply(
                      this,
                      Array.prototype.slice.call(arguments).concat([])
                    );
                  }.bind(this),
                  allowClear: false,
                  placeholder: this.i18n('i18n-4yz69icb') /* 请选择发布仓库 */,
                  _sdkSwrGetFunc: { params: [] },
                },
              }}
              __component_name="FormilySelect"
            />
            {!!false && (
              <FormilyFormItem
                fieldProps={{
                  name: 'FormilyFormItem',
                  title: this.i18n('i18n-i44aj3t5') /* 仓库地址 */,
                  'x-component': 'FormilyFormItem',
                  'x-validator': [],
                }}
                componentProps={{ 'x-component-props': {} }}
                __component_name="FormilyFormItem"
              >
                <Typography.Text
                  style={{ fontSize: '' }}
                  strong={false}
                  disabled={false}
                  ellipsis={true}
                  __component_name="Typography.Text"
                >
                  {__$$eval(() => this.getChannelUrl() || '-')}
                </Typography.Text>
              </FormilyFormItem>
            )}
            {!!false && (
              <FormilyInput
                fieldProps={{
                  name: 'url',
                  title: this.i18n('i18n-i44aj3t5') /* 仓库地址 */,
                  'x-pattern': 'disabled',
                  'x-validator': [],
                  _unsafe_MixedSetter_default_select: 'VariableSetter',
                }}
                componentProps={{
                  'x-component-props': {
                    value: '{{111111111}}',
                    placeholder: this.i18n('i18n-ukhgf87d') /* 请输入仓库地址 */,
                  },
                }}
                __component_name="FormilyInput"
              />
            )}
            <FormilyInput
              fieldProps={{
                name: 'channelUrl',
                title: this.i18n('i18n-i44aj3t5') /* 仓库地址 */,
                default: __$$eval(() => this.getChannels()?.[0]?.detail?.url),
                'x-pattern': 'disabled',
                'x-validator': [],
                _unsafe_MixedSetter_default_select: 'VariableSetter',
              }}
              componentProps={{
                'x-component-props': { placeholder: this.i18n('i18n-gu28o58e') /* 请先选择仓库 */ },
              }}
              decoratorProps={{ 'x-decorator-props': { asterisk: true } }}
              __component_name="FormilyInput"
            />
            <FormilyInput
              fieldProps={{
                name: 'version',
                title: this.i18n('i18n-vcavv6ts') /* 发布版本 */,
                required: true,
                'x-validator': [
                  {
                    id: 'disabled',
                    type: 'disabled',
                    message:
                      this.i18n(
                        'i18n-cmfovsoe'
                      ) /* 由50位字母、数字、点"."、中划线"-"或加号"+" 组成，且必须以数字开头，以数字或字母结尾 */,
                    pattern: '^[0-9]{1}[A-Za-z0-9\\-\\.\\+]{1,48}[a-zA-Z0-9]+$',
                    children: '未知',
                  },
                  {
                    id: 'disabled',
                    type: 'disabled',
                    message: this.i18n('i18n-41nz9vbg') /* 版本号格式不正确 */,
                    pattern:
                      '^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$',
                    children: '未知',
                  },
                  {
                    id: 'disabled',
                    type: 'disabled',
                    children: '未知',
                    validator: function () {
                      return this.validatorPublishVersion.apply(
                        this,
                        Array.prototype.slice.call(arguments).concat([])
                      );
                    }.bind(this),
                    triggerType: 'onBlur',
                  },
                ],
              }}
              componentProps={{
                'x-component-props': {
                  placeholder: this.i18n('i18n-5it1hw2u') /* 请输入版本号，例 0.0.1 */,
                },
              }}
              __component_name="FormilyInput"
            />
          </FormilyForm>
        </Modal>
        <Card
          size="default"
          type="default"
          style={{}}
          actions={[]}
          loading={false}
          bordered={false}
          hoverable={false}
          __component_name="Card"
        >
          <Tabs
            size="large"
            type="line"
            items={[
              {
                key: 'tab-item-1',
                label: this.i18n('i18n-tnmitd0v') /* 发布记录 */,
                children: (
                  <Row wrap={true} gutter={[0, 0]} __component_name="Row">
                    <Col span={24} __component_name="Col">
                      <Row wrap={false} justify="space-between" __component_name="Row">
                        <Col __component_name="Col">
                          <Space align="center" direction="horizontal">
                            <Button
                              icon={
                                <AntdIconPlusOutlined __component_name="AntdIconPlusOutlined" />
                              }
                              type="primary"
                              block={false}
                              ghost={false}
                              shape="default"
                              danger={false}
                              onClick={function () {
                                return this.openAddPublishModal.apply(
                                  this,
                                  Array.prototype.slice.call(arguments).concat([])
                                );
                              }.bind(this)}
                              disabled={__$$eval(() => !this.canEditAppPublish())}
                              __component_name="Button"
                            >
                              {this.i18n('i18n-vmthidgk') /* 发布应用 */}
                            </Button>
                            <Button
                              icon={
                                <AntdIconReloadOutlined
                                  style={{ marginRight: '3px' }}
                                  __component_name="AntdIconReloadOutlined"
                                />
                              }
                              block={false}
                              ghost={false}
                              shape="default"
                              danger={false}
                              loading={false}
                              onClick={function () {
                                return this.handleRefreshPublish.apply(
                                  this,
                                  Array.prototype.slice.call(arguments).concat([])
                                );
                              }.bind(this)}
                              disabled={false}
                              __component_name="Button"
                            >
                              {this.i18n('i18n-cz07vq08') /* 刷新 */}
                            </Button>
                          </Space>
                        </Col>
                        <Col __component_name="Col">
                          <Space
                            size="large"
                            align="center"
                            direction="horizontal"
                            __component_name="Space"
                          >
                            <Input.Search
                              onChange={function () {
                                return this.handlePublishSearvhValueChange.apply(
                                  this,
                                  Array.prototype.slice.call(arguments).concat([])
                                );
                              }.bind(this)}
                              placeholder={this.i18n('i18n-g1vk6fk1') /* 输入仓库名称搜索 */}
                              __component_name="Input.Search"
                            />
                          </Space>
                        </Col>
                      </Row>
                    </Col>
                    <Col span={24} __component_name="Col">
                      <Table
                        size="default"
                        style={{ marginTop: '-0px' }}
                        rowKey="id"
                        scroll={{ scrollToFirstRowOnChange: true }}
                        columns={[
                          {
                            key: 'name',
                            title: this.i18n('i18n-q05eb4ej') /* 发布名称 */,
                            dataIndex: 'name',
                          },
                          {
                            key: 'baseline',
                            title: this.i18n('i18n-uu6jp4fr') /* 发布基线 */,
                            render: (text, record, index) =>
                              (__$$context => [
                                !!__$$eval(() => record?.baseline === 'Branch') && (
                                  <Space
                                    size={0}
                                    align="center"
                                    direction="horizontal"
                                    __component_name="Space"
                                    key="node_oclmolsjkt2"
                                  >
                                    <Popover
                                      style={{}}
                                      content={
                                        <Descriptions
                                          id=""
                                          size="default"
                                          colon={false}
                                          items={[
                                            {
                                              key: '4dimgc3dw7c',
                                              span: 1,
                                              label: this.i18n('i18n-gnabgk8z') /* 提交人 */,
                                              children: (
                                                <Typography.Text
                                                  style={{ fontSize: '' }}
                                                  strong={false}
                                                  disabled={false}
                                                  ellipsis={true}
                                                  __component_name="Typography.Text"
                                                >
                                                  {__$$eval(
                                                    () => record?.detail?.commit?.committer || '-'
                                                  )}
                                                </Typography.Text>
                                              ),
                                            },
                                            {
                                              key: 'mmlqz0ve9g9',
                                              span: 1,
                                              label: this.i18n('i18n-7q5i93tv') /* 提交时间 */,
                                              children: (
                                                <Typography.Time
                                                  time={__$$eval(
                                                    () => record?.detail?.commit?.date || '-'
                                                  )}
                                                  format=""
                                                  relativeTime={false}
                                                  __component_name="Typography.Time"
                                                />
                                              ),
                                            },
                                            {
                                              key: 'w5qjkh705rm',
                                              span: 1,
                                              label: this.i18n('i18n-sivgv5vw') /* 提交信息 */,
                                              children: (
                                                <Typography.Text
                                                  style={{ width: '220px' }}
                                                  strong={false}
                                                  disabled={false}
                                                  ellipsis={{
                                                    tooltip: {
                                                      title: __$$eval(
                                                        () => record?.detail?.commit?.message || '-'
                                                      ),
                                                      _unsafe_MixedSetter_title_select:
                                                        'VariableSetter',
                                                    },
                                                  }}
                                                  __component_name="Typography.Text"
                                                >
                                                  {__$$eval(
                                                    () => record?.detail?.commit?.message || '-'
                                                  )}
                                                </Typography.Text>
                                              ),
                                            },
                                          ]}
                                          title=""
                                          column={1}
                                          layout="horizontal"
                                          bordered={false}
                                          labelStyle={{ width: 70 }}
                                          borderedBottom={false}
                                          __component_name="Descriptions"
                                          borderedBottomDashed={false}
                                        />
                                      }
                                      trigger="hover"
                                      overlayStyle={{ minWidth: 350 }}
                                      __component_name="Popover"
                                      destroyTooltipOnHide={true}
                                    >
                                      <Typography.Text
                                        style={{ fontSize: '' }}
                                        strong={false}
                                        disabled={false}
                                        ellipsis={true}
                                        __component_name="Typography.Text"
                                      >
                                        {__$$eval(() => __$$context.getRowBaseline(record) || '-')}
                                      </Typography.Text>
                                    </Popover>
                                  </Space>
                                ),
                                <Popover
                                  style={{}}
                                  content={
                                    <Descriptions
                                      id=""
                                      size="default"
                                      colon={false}
                                      items={[
                                        {
                                          key: '4dimgc3dw7c',
                                          span: 1,
                                          label: this.i18n('i18n-gnabgk8z') /* 提交人 */,
                                          children: (
                                            <Typography.Text
                                              style={{ fontSize: '' }}
                                              strong={false}
                                              disabled={false}
                                              ellipsis={true}
                                              __component_name="Typography.Text"
                                            >
                                              {__$$eval(
                                                () => record?.detail?.commit?.committer || '-'
                                              )}
                                            </Typography.Text>
                                          ),
                                        },
                                        {
                                          key: 'mmlqz0ve9g9',
                                          span: 1,
                                          label: this.i18n('i18n-7q5i93tv') /* 提交时间 */,
                                          children: (
                                            <Typography.Time
                                              time={__$$eval(
                                                () => record?.detail?.commit?.date || '-'
                                              )}
                                              format=""
                                              relativeTime={false}
                                              __component_name="Typography.Time"
                                            />
                                          ),
                                        },
                                        {
                                          key: 'w5qjkh705rm',
                                          span: 1,
                                          label: this.i18n('i18n-sivgv5vw') /* 提交信息 */,
                                          children: (
                                            <Typography.Text
                                              style={{ width: '150px' }}
                                              strong={false}
                                              disabled={false}
                                              ellipsis={{
                                                tooltip: {
                                                  title: __$$eval(
                                                    () => record?.detail?.commit?.message || '-'
                                                  ),
                                                  _unsafe_MixedSetter_title_select:
                                                    'VariableSetter',
                                                },
                                              }}
                                              __component_name="Typography.Text"
                                            >
                                              {__$$eval(
                                                () => record?.detail?.commit?.message || '-'
                                              )}
                                            </Typography.Text>
                                          ),
                                        },
                                      ]}
                                      title=""
                                      column={1}
                                      layout="horizontal"
                                      bordered={false}
                                      labelStyle={{ width: 70 }}
                                      borderedBottom={false}
                                      __component_name="Descriptions"
                                      borderedBottomDashed={false}
                                    />
                                  }
                                  trigger="hover"
                                  __component_name="Popover"
                                  destroyTooltipOnHide={true}
                                  key="node_oclmom6kwl1"
                                >
                                  {!!__$$eval(() => record?.baseline === 'CommitId') && (
                                    <Typography.Text
                                      style={{ fontSize: '' }}
                                      strong={false}
                                      disabled={false}
                                      ellipsis={true}
                                      __component_name="Typography.Text"
                                    >
                                      {__$$eval(() => __$$context.getRowBaseline(record))}
                                    </Typography.Text>
                                  )}
                                </Popover>,
                              ])(__$$createChildContext(__$$context, { text, record, index })),
                            dataIndex: 'baseline',
                          },
                          {
                            key: 'status',
                            title: this.i18n('i18n-jwiudi2n') /* 发布状态 */,
                            width: 120,
                            render: (text, record, index) =>
                              (__$$context => (
                                <Row wrap={true} gutter={[0, 0]} __component_name="Row">
                                  <Col span={24} __component_name="Col">
                                    <Space
                                      align="center"
                                      direction="horizontal"
                                      __component_name="Space"
                                    >
                                      <Status
                                        id={__$$eval(() => text)}
                                        style={{}}
                                        types={__$$eval(() =>
                                          __$$context.utils.getPublishStatus(__$$context, 'status')
                                        )}
                                        __component_name="Status"
                                      />
                                      <Popover
                                        color="#ffffff"
                                        style={{}}
                                        content={
                                          <Row wrap={true} gutter={[0, 0]} __component_name="Row">
                                            <Col span={24} __component_name="Col">
                                              <Descriptions
                                                id=""
                                                size="default"
                                                colon={false}
                                                items={[
                                                  {
                                                    key: 'juq03uwmwj',
                                                    span: 1,
                                                    label:
                                                      this.i18n('i18n-laqlm1vs') /* 流水线ID */,
                                                    children: (
                                                      <Typography.Text
                                                        style={{ fontSize: '' }}
                                                        strong={false}
                                                        disabled={false}
                                                        ellipsis={true}
                                                        __component_name="Typography.Text"
                                                      >
                                                        {__$$eval(() => record.buildId || '-')}
                                                      </Typography.Text>
                                                    ),
                                                  },
                                                  {
                                                    key: 'wvatsvvbdr',
                                                    span: 1,
                                                    label:
                                                      this.i18n('i18n-03ln0qu5') /* 失败原因 */,
                                                    children: [
                                                      <Typography.Paragraph
                                                        ellipsis={false}
                                                        style={{ width: '300px', fontSize: '' }}
                                                        code={false}
                                                        delete={false}
                                                        disabled={false}
                                                        editable={false}
                                                        mark={false}
                                                        underline={false}
                                                        strong={false}
                                                        key="node_oclpkyqdtq1"
                                                      >
                                                        {__$$eval(
                                                          () =>
                                                            record?.detail?.status?.message || '-'
                                                        )}
                                                      </Typography.Paragraph>,
                                                      !!false && (
                                                        <Typography.Text
                                                          style={{ width: '300px', fontSize: '' }}
                                                          strong={false}
                                                          disabled={false}
                                                          ellipsis={true}
                                                          __component_name="Typography.Text"
                                                          key="node_oclnu0cftbr"
                                                        >
                                                          {__$$eval(
                                                            () =>
                                                              record?.detail?.status?.message || '-'
                                                          )}
                                                        </Typography.Text>
                                                      ),
                                                    ],
                                                  },
                                                ]}
                                                title=""
                                                column={1}
                                                layout="horizontal"
                                                bordered={false}
                                                labelStyle={{ width: 70 }}
                                                borderedBottom={false}
                                                __component_name="Descriptions"
                                                borderedBottomDashed={false}
                                              >
                                                <Descriptions.Item
                                                  key="juq03uwmwj"
                                                  span={1}
                                                  label={this.i18n('i18n-laqlm1vs') /* 流水线ID */}
                                                >
                                                  {null}
                                                </Descriptions.Item>
                                                <Descriptions.Item
                                                  key="wvatsvvbdr"
                                                  span={1}
                                                  label={this.i18n('i18n-03ln0qu5') /* 失败原因 */}
                                                >
                                                  {null}
                                                </Descriptions.Item>
                                              </Descriptions>
                                            </Col>
                                          </Row>
                                        }
                                        trigger="hover"
                                        overlayStyle={{ minWidth: 400, width: 400 }}
                                        __component_name="Popover"
                                        destroyTooltipOnHide={true}
                                      >
                                        {!!__$$eval(() => text !== 'Done') && (
                                          <AntdIconInfoCircleFilled
                                            style={{ color: '#00000045' }}
                                            __component_name="AntdIconInfoCircleFilled"
                                          />
                                        )}
                                      </Popover>
                                    </Space>
                                  </Col>
                                  <Col span={24} __component_name="Col">
                                    {!!__$$eval(() => record?.status === 'Running') && (
                                      <Progress
                                        status="active"
                                        percent={__$$eval(
                                          () => record?.detail?.status?.progress || 0
                                        )}
                                        strokeColor={__$$eval(
                                          () =>
                                            __$$context.utils
                                              .getPublishStatus(__$$context)
                                              .find(item => item.value === text)?.color
                                        )}
                                        __component_name="Progress"
                                      />
                                    )}
                                  </Col>
                                </Row>
                              ))(__$$createChildContext(__$$context, { text, record, index })),
                            filters: __$$eval(() => this.utils.getPublishStatus(this)),
                            dataIndex: 'status',
                          },
                          {
                            key: 'version',
                            title: this.i18n('i18n-vcavv6ts') /* 发布版本 */,
                            dataIndex: 'version',
                          },
                          {
                            key: 'channel',
                            title: this.i18n('i18n-twtfn0kc') /* 组件仓库名称 */,
                            dataIndex: __$$eval(() => ['detail', 'channel', 'name']),
                          },
                          {
                            key: 'channelstatus',
                            title: this.i18n('i18n-aaesfoga') /* 组件仓库状态 */,
                            render: (text, record, index) =>
                              (__$$context => (
                                <Status
                                  id={__$$eval(() => text)}
                                  types={__$$eval(() =>
                                    __$$context.utils.getChannelStatus(__$$context, 'status')
                                  )}
                                  __component_name="Status"
                                />
                              ))(__$$createChildContext(__$$context, { text, record, index })),
                            dataIndex: __$$eval(() => ['detail', 'channel', 'status']),
                          },
                          {
                            key: 'channelurl',
                            title: this.i18n('i18n-11r38hcr') /* 组件仓库地址 */,
                            dataIndex: __$$eval(() => ['detail', 'channel', 'detail', 'url']),
                          },
                          {
                            title: this.i18n('i18n-tbc50yra') /* 发布者 */,
                            dataIndex: __$$eval(() => ['publisher', 'name']),
                          },
                          {
                            key: 'createAt',
                            title: this.i18n('i18n-5pd068z7') /* 发布时间 */,
                            render: (text, record, index) =>
                              (__$$context => (
                                <Typography.Time
                                  time={__$$eval(() => text)}
                                  format=""
                                  relativeTime={true}
                                />
                              ))(__$$createChildContext(__$$context, { text, record, index })),
                            sorter: true,
                            dataIndex: 'createAt',
                          },
                          {
                            title: this.i18n('i18n-uel9pjrj') /* 操作 */,
                            render: /* 插槽容器*/ (text, record, index) =>
                              (__$$context => (
                                <Button
                                  type="default"
                                  block={false}
                                  ghost={false}
                                  shape="default"
                                  danger={true}
                                  onClick={function () {
                                    return this.openModal.apply(
                                      this,
                                      Array.prototype.slice.call(arguments).concat([
                                        {
                                          record: record,
                                          type: 'deletePublish',
                                        },
                                      ])
                                    );
                                  }.bind(__$$context)}
                                  disabled={__$$eval(() => !__$$context.canEditAppPublish())}
                                  __component_name="Button"
                                >
                                  {this.i18n('i18n-it3zdrk8') /* 删除 */}
                                </Button>
                              ))(__$$createChildContext(__$$context, { text, record, index })),
                            dataIndex: 'op',
                          },
                        ]}
                        loading={__$$eval(() => this.props.useGetAppPublishRecords?.loading)}
                        onChange={function () {
                          return this.handlePublishTableChange.apply(
                            this,
                            Array.prototype.slice.call(arguments).concat([])
                          );
                        }.bind(this)}
                        dataSource={__$$eval(() => this.getPublishData().data)}
                        pagination={{
                          size: 'default',
                          total: __$$eval(() => this.getPublishData().total),
                          simple: false,
                          current: __$$eval(() => this.state.publishCurrent),
                          onChange: function () {
                            return this.handlePublishPaginationChange.apply(
                              this,
                              Array.prototype.slice.call(arguments).concat([])
                            );
                          }.bind(this),
                          pageSize: __$$eval(() => this.state.publishSize),
                          showQuickJumper: false,
                          showSizeChanger: false,
                          onShowSizeChange: function () {
                            return this.handlePublishPaginationChange.apply(
                              this,
                              Array.prototype.slice.call(arguments).concat([])
                            );
                          }.bind(this),
                        }}
                        showHeader={true}
                        __component_name="Table"
                      />
                    </Col>
                  </Row>
                ),
              },
              {
                key: 'tab-item-2',
                label: this.i18n('i18n-ptgr3r7b') /* 组件仓库管理 */,
                hidden: __$$eval(() => !this.canEditAppPublish()),
                children: (
                  <Row wrap={true} gutter={[0, 0]} __component_name="Row">
                    <Col span={24} __component_name="Col">
                      <Row wrap={true} gutter={[0, 0]} __component_name="Row" />
                    </Col>
                  </Row>
                ),
              },
            ]}
            style={{ marginTop: '-20px' }}
            activeKey=""
            onTabClick={function () {
              return this.onTabChange.apply(this, Array.prototype.slice.call(arguments).concat([]));
            }.bind(this)}
            tabPosition="top"
            __component_name="Tabs"
            destroyInactiveTabPane="true"
          />
        </Card>
      </Page>
    );
  }
}

const PageWrapper = (props = {}) => {
  const location = useLocation();
  const history = getUnifiedHistory();
  const match = matchPath({ path: '/apps/:appId/publish-records' }, location.pathname);
  history.match = match;
  history.query = qs.parse(location.search);
  const appHelper = {
    utils,
    location,
    match,
    history,
  };
  const self = {
    appHelper,
    ...appHelper,
  };
  return (
    <DataProvider
      self={self}
      sdkInitFunc={{
        enabled: false,
        func: 'getSdkByAppId',
        params: undefined,
      }}
      sdkSwrFuncs={[
        {
          func: 'useGetAppPublishRecords',
          params: function applyThis() {
            return {
              id: this.match?.params?.appId,
              pubrOptions: {
                page: 1,
                pageSize: 10,
              },
            };
          }.apply(self),
          enableLocationSearch: function applyThis() {
            return true;
          }.apply(self),
        },
        {
          func: 'useGetCurrentUser',
          params: undefined,
          enableLocationSearch: undefined,
        },
        {
          func: 'useGetApp',
          params: function applyThis() {
            return {
              id: this.match?.params?.appId,
            };
          }.apply(self),
          enableLocationSearch: undefined,
        },
      ]}
      render={dataProps => (
        <AppPublishRecords$$Page {...props} {...dataProps} self={self} appHelper={appHelper} />
      )}
    />
  );
};
export default PageWrapper;

function __$$eval(expr) {
  try {
    return expr();
  } catch (error) {}
}

function __$$evalArray(expr) {
  const res = __$$eval(expr);
  return Array.isArray(res) ? res : [];
}

function __$$createChildContext(oldContext, ext) {
  const childContext = {
    ...oldContext,
    ...ext,
  };
  childContext.__proto__ = oldContext;
  return childContext;
}
