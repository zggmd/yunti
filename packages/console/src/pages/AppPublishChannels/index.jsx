// 注意: 出码引擎注入的临时变量默认都以 "__$$" 开头，禁止在搭建的代码中直接访问。
// 例外：react 框架的导出名和各种组件名除外。
import React from 'react';

import {
  Page,
  Modal,
  FormilyForm,
  FormilyInput,
  Space,
  Typography,
  Tooltip,
  Row,
  Col,
  FormilyCheckbox,
  FormilyPassword,
  Button,
  Alert,
  Card,
  Tabs,
  Input,
  Table,
  Status,
} from '@tenx-ui/materials';

import {
  AntdIconQuestionCircleOutlined,
  AntdIconPlusOutlined,
  AntdIconReloadOutlined,
} from '@tenx-ui/icon-materials';

import { useLocation, matchPath } from '@umijs/max';
import DataProvider from '../../components/DataProvider';
import qs from 'query-string';
import { getUnifiedHistory } from '@tenx-ui/utils/es/UnifiedLink/index.prod';

import utils, { RefsManager } from '../../utils/__utils';

import * as __$$i18n from '../../i18n';

import __$$constants from '../../__constants';

import './index.css';

class AppPublishChannels$$Page extends React.Component {
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
      pageId: undefined,
      record: undefined,
      modalLoading: false,
      modalOpen: false,
      modalType: 'addPublish',
      repoSearchValue: undefined,
      repoCurrent: 1,
      repoSize: 10,
      repoPagination: undefined,
      allRepoData: undefined,
      timer: undefined,
    };
  }

  $ = refName => {
    return this._refsManager.get(refName);
  };

  $$ = refName => {
    return this._refsManager.getAll(refName);
  };

  validatorUrl(value) {
    if (value && !this.utils.isUrl(value)) {
      return this.i18n('i18n-46pmimcv');
    }
  }

  onTabChange(v) {
    if (v === 'tab-item-1') {
      this.appHelper.history?.replace(`/apps/${this.match?.params?.appId}/publish-records`);
    }
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
        if (['editRepo', 'detailRepo'].includes(modalType)) {
          this.initRepoForm(record);
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

  openAddRepoModal() {
    if (this.state.timer) {
      clearTimeout(this.state.timer);
    }
    this.openModal('addRepo');
  }

  initRepoForm(record) {
    const form = this.$('add_repo_form')?.formRef?.current?.form;
    if (form) {
      form.setValues({
        name: record?.name,
        url: record?.detail?.url,
        password: record?.detail?.password,
        username: record?.detail?.username,
        builtIn: record?.builtIn ? ['true'] : [],
      });
      return;
    }
    if (this.state.timer) {
      clearTimeout(this.state.timer);
    }
    this.setState({
      timer: setTimeout(() => {
        this.initRepoForm(record);
      }, 200),
    });
  }

  validatorRepoName(value) {
    if (value && this.state.modalType === 'addRepo') {
      const list = this.state.allRepoData || [];
      if (list.some(item => item.name === value)) {
        return this.i18n('i18n-my0gyopa');
      }
    }
  }

  async confirmAddRepo(e) {
    const form = this.$('add_repo_form')?.formRef?.current?.form;
    form.submit(async values => {
      const info = {
        addRepo: {
          api: 'createPublishChannel',
          successMessage: this.i18n('i18n-uhih9oip'),
          failedMessage: this.i18n('i18n-m63pnjjo'),
          channel: {
            builtIn: !!values.builtIn?.includes('true'),
            appId: this.match?.params?.appId,
            name: values.name,
            type: 'Helm',
            helm: {
              url: values.url,
              password: values.password && this.utils.encodeBase64(values.password),
              username: values.username && this.utils.encodeBase64(values.username),
            },
          },
        },
        editRepo: {
          api: 'updatePublishChannel',
          successMessage: this.i18n('i18n-8ed1z1oe'),
          failedMessage: this.i18n('i18n-usdl74qf'),
          channel: {
            id: this?.state?.record?.id,
            type: 'Helm',
            helm: {
              url: values.url,
              password: values.password && this.utils.encodeBase64(values.password),
              username: values.username && this.utils.encodeBase64(values.username),
            },
          },
        },
      }[this.state.modalType];
      this.setState({
        modalLoading: true,
      });
      try {
        await this.utils.bff[info.api]({
          channel: info.channel,
        });
        this.closeModal();
        this.utils.notification.success({
          message: info.successMessage,
        });
        this.handleRefreshRepo();
      } catch (error) {
        this.setState({
          modalLoading: false,
        });
        this.utils.notification.warnings({
          message: info.failedMessage,
          errors: error?.response?.errors,
        });
      }
    });
  }

  handleRefreshRepo() {
    this.props.useGetAppPublishChannels.mutate();
  }

  handleRepoSearvhValueChange(e) {
    this.setState(
      {
        repoSearchValue: e.target.value,
        repoCurrent: 1,
      },
      this.loadRepoData
    );
  }

  async loadAllRepoData() {
    const res = await this.utils.bff.getAppPublishChannels({
      id: this.match?.params?.appId,
    });
    this.setState({
      allRepoData: res?.app?.publishChannels,
    });
  }

  loadRepoData() {
    const { status } = this.state.repoPagination?.filters || {};
    const params = {
      id: this.match?.params?.appId,
      pubcOptions: {
        filter: {},
      },
    };
    if (this.state.repoPagination?.sorter?.order) {
      params.pubcOptions.order = {
        // ascend descend
        updateAt: this.state.repoPagination?.sorter?.order === 'ascend' ? 'ASC' : 'DESC',
      };
    }
    if (status?.length === 1) {
      if (!params.pubcOptions.filter) {
        params.pubcOptions.filter = {};
      }
      params.pubcOptions.filter.status = status?.[0];
    }
    if (this.state.repoSearchValue) {
      if (!params.pubcOptions.filter) {
        params.pubcOptions.filter = {};
      }
      params.pubcOptions.filter.q = this.state.repoSearchValue;
    }
    this.utils?.changeLocationQuery(this, 'useGetAppPublishChannels', params);
  }

  getRepoData() {
    const list = this.props.useGetAppPublishChannels?.data?.app?.publishChannels;
    const filterList = list?.slice(
      (this.state.repoCurrent - 1) * this.state.repoSize,
      this.state.repoCurrent * this.state.repoSize
    );
    return {
      data: filterList || [],
      total: list?.length || 0,
    };
  }

  handleRepoPaginationChange(c, s) {
    this.setState({
      repoSize: s,
      repoCurrent: c,
    });
  }

  handleRepoTableChange(pagination, filters, sorter, extra) {
    this.setState(
      {
        repoPagination: {
          pagination,
          filters,
          sorter,
        },
      },
      this.loadRepoData
    );
  }

  async confirmRemoveRepo() {
    const form = this.$('formily_delete_repo')?.formRef?.current?.form;
    form.submit(async values => {
      this.setState({
        modalLoading: true,
      });
      await this.utils.bff.deletePublishChannel({
        id: this.state.record?.id,
        clearPublishRecords: values?.record?.includes('true'),
      });
      this.closeModal();
      this.utils.notification.success({
        message: this.i18n('i18n-j8ze773g'),
      });
      this.handleRefreshRepo();
    });
  }

  canEditAppPublish() {
    const currentUser = this.props.useGetCurrentUser?.data?.currentUser;
    return (
      currentUser?.role === 'SystemAdmin' ||
      ['Owner', 'Maintainer'].includes(
        this.props.useGetApp?.data?.app?.members.find(m => (m.member.name = currentUser.name))?.role
      )
    );
  }

  isSystemAdmin() {
    const currentUser = this.props.useGetCurrentUser?.data?.currentUser;
    return currentUser?.role === 'SystemAdmin';
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
            return this.confirmAddRepo.apply(
              this,
              Array.prototype.slice.call(arguments).concat([])
            );
          }.bind(this)}
          open={__$$eval(
            () =>
              ['editRepo', 'addRepo', 'detailRepo'].includes(this.state.modalType) &&
              this.state.modalOpen
          )}
          title={__$$eval(() =>
            this.state.modalType === 'addRepo'
              ? this.i18n('i18n-gklza56m')
              : this.state.modalType === 'editRepo'
              ? this.i18n('i18n-xx5cxe33')
              : this.i18n('i18n-o241k589')
          )}
          footer={
            <Space align="center" direction="horizontal" __component_name="Space">
              {!!__$$eval(() => !['detailRepo'].includes(this.state.modalType)) && (
                <Button
                  block={false}
                  ghost={false}
                  shape="default"
                  danger={false}
                  onClick={function () {
                    return this.closeModal.apply(
                      this,
                      Array.prototype.slice.call(arguments).concat([])
                    );
                  }.bind(this)}
                  disabled={false}
                  __component_name="Button"
                >
                  {this.i18n('i18n-etgx4cun') /* 取消 */}
                </Button>
              )}
              {!!__$$eval(() => !['detailRepo'].includes(this.state.modalType)) && (
                <Button
                  type="primary"
                  block={false}
                  ghost={false}
                  shape="default"
                  danger={false}
                  loading={__$$eval(() => this.state.modalLoading)}
                  onClick={function () {
                    return this.confirmAddRepo.apply(
                      this,
                      Array.prototype.slice.call(arguments).concat([])
                    );
                  }.bind(this)}
                  disabled={false}
                  __component_name="Button"
                >
                  {this.i18n('i18n-qxi7rhuh') /* 确定 */}
                </Button>
              )}
              {!!__$$eval(() => ['detailRepo'].includes(this.state.modalType)) && (
                <Button
                  type="default"
                  block={false}
                  ghost={false}
                  shape="default"
                  danger={false}
                  onClick={function () {
                    return this.closeModal.apply(
                      this,
                      Array.prototype.slice.call(arguments).concat([])
                    );
                  }.bind(this)}
                  disabled={false}
                  __component_name="Button"
                >
                  {this.i18n('i18n-w3sx3iid') /* 关闭 */}
                </Button>
              )}
            </Space>
          }
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
            ref={this._refsManager.linkRef('add_repo_form')}
            componentProps={{
              colon: false,
              layout: 'horizontal',
              labelCol: 7,
              labelAlign: 'left',
              wrapperCol: 20,
            }}
            __component_name="FormilyForm"
          >
            <FormilyInput
              fieldProps={{
                name: 'name',
                title: (
                  <Space align="center" direction="horizontal" __component_name="Space">
                    <Typography.Text
                      style={{ fontSize: '' }}
                      strong={false}
                      disabled={false}
                      ellipsis={true}
                      __component_name="Typography.Text"
                    >
                      {this.i18n('i18n-twtfn0kc') /* 组件仓库名称 */}
                    </Typography.Text>
                    <Tooltip
                      title={
                        <Row wrap={true} gutter={[0, 0]} __component_name="Row">
                          <Col span={24} __component_name="Col">
                            <Typography.Text
                              style={{ color: '#ffffff', fontSize: '' }}
                              strong={false}
                              disabled={false}
                              ellipsis={true}
                              __component_name="Typography.Text"
                            >
                              {this.i18n('i18n-zkqmzk1j') /* 目前支持Chart Museum类型的helm仓库 */}
                            </Typography.Text>
                          </Col>
                          <Col span={24} __component_name="Col">
                            <Typography.Text
                              style={{ color: '#ffffff', fontSize: '' }}
                              strong={false}
                              disabled={false}
                              ellipsis={true}
                              __component_name="Typography.Text"
                            >
                              {this.i18n('i18n-5tqo0ca8') /* 内置仓库适用于平台所有应用 */}
                            </Typography.Text>
                          </Col>
                        </Row>
                      }
                      __component_name="Tooltip"
                    >
                      <AntdIconQuestionCircleOutlined
                        style={{ color: '#9b9b9b' }}
                        __component_name="AntdIconQuestionCircleOutlined"
                      />
                    </Tooltip>
                  </Space>
                ),
                required: true,
                'x-pattern': __$$eval(() =>
                  ['editRepo', 'detailRepo'].includes(this.state.modalType)
                    ? 'disabled'
                    : 'editable'
                ),
                'x-validator': [
                  {
                    id: 'disabled',
                    type: 'disabled',
                    message:
                      this.i18n(
                        'i18n-aldyt5z9'
                      ) /* 由3~63位字符、下划线“_”、中划线“-”或点“.”组成，并以字符开头或结尾 */,
                    pattern: '^[a-zA-Z]{1}[A-Za-z0-9_\\-\\.]{1,61}[a-zA-Z0-9]+$',
                    children: '未知',
                  },
                  {
                    id: 'disabled',
                    type: 'disabled',
                    children: '未知',
                    validator: function () {
                      return this.validatorRepoName.apply(
                        this,
                        Array.prototype.slice.call(arguments).concat([])
                      );
                    }.bind(this),
                    triggerType: 'onInput',
                  },
                ],
                _unsafe_MixedSetter_title_select: 'SlotSetter',
              }}
              componentProps={{
                'x-component-props': {
                  placeholder: this.i18n('i18n-wjytn4ph') /* 请输入仓库名称 */,
                },
              }}
              __component_name="FormilyInput"
            />
            <FormilyCheckbox
              style={{ marginLeft: '136px' }}
              fieldProps={{
                enum: [{ label: this.i18n('i18n-0qv5agal') /* 内置仓库 */, value: 'true' }],
                name: 'builtIn',
                title: '',
                'x-pattern': __$$eval(() =>
                  ['editRepo', 'detailRepo'].includes(this.state.modalType) || !this.isSystemAdmin()
                    ? 'disabled'
                    : 'editable'
                ),
                'x-validator': [],
              }}
              componentProps={{ 'x-component-props': { _sdkSwrGetFunc: {} } }}
              __component_name="FormilyCheckbox"
            />
            <FormilyInput
              fieldProps={{
                name: 'url',
                title: this.i18n('i18n-i44aj3t5') /* 仓库地址 */,
                required: true,
                'x-pattern': __$$eval(() =>
                  ['detailRepo'].includes(this.state.modalType) ? 'disabled' : 'editable'
                ),
                'x-validator': [
                  {
                    id: 'disabled',
                    children: '未知',
                    type: 'disabled',
                    validator: function () {
                      return this.validatorUrl.apply(
                        this,
                        Array.prototype.slice.call(arguments).concat([])
                      );
                    }.bind(this),
                  },
                ],
              }}
              componentProps={{
                'x-component-props': {
                  placeholder:
                    this.i18n(
                      'i18n-d9cz9maq'
                    ) /* 请输入仓库地址，例http://192.168.1.1:80/repository */,
                },
              }}
              __component_name="FormilyInput"
            />
            <FormilyInput
              fieldProps={{
                name: 'username',
                title: this.i18n('i18n-n65mm74u') /* 用户名 */,
                required: false,
                'x-pattern': __$$eval(() =>
                  ['detailRepo'].includes(this.state.modalType) ? 'disabled' : 'editable'
                ),
                'x-validator': [],
              }}
              componentProps={{
                'x-component-props': { placeholder: this.i18n('i18n-8x2ne1ec') /* 请输入用户名 */ },
              }}
              __component_name="FormilyInput"
            />
            <FormilyPassword
              fieldProps={{
                name: 'password',
                title: this.i18n('i18n-jrlkaisr') /* 密码 */,
                'x-pattern': __$$eval(() =>
                  ['detailRepo'].includes(this.state.modalType) ? 'disabled' : 'editable'
                ),
                'x-validator': [],
              }}
              componentProps={{
                'x-component-props': { placeholder: this.i18n('i18n-buh24m5l') /* 请输入密码 */ },
              }}
              __component_name="FormilyPassword"
            />
          </FormilyForm>
        </Modal>
        <Modal
          mask={true}
          onOk={function () {
            return this.confirmRemoveRepo.apply(
              this,
              Array.prototype.slice.call(arguments).concat([])
            );
          }.bind(this)}
          open={__$$eval(() => this.state.modalOpen && this.state.modalType === 'deleteRepo')}
          title={this.i18n('i18n-u58088zr') /* 删除组件仓库 */}
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
                  <Space align="center" direction="horizontal" __component_name="Space">
                    <Typography.Text
                      style={{ fontSize: '' }}
                      strong={false}
                      disabled={false}
                      ellipsis={true}
                      __component_name="Typography.Text"
                    >
                      {this.i18n('i18n-w6uloaol') /* 确定删除组件仓库 */}
                    </Typography.Text>
                    <Typography.Text
                      style={{ fontSize: '' }}
                      strong={false}
                      disabled={false}
                      ellipsis={true}
                      __component_name="Typography.Text"
                    >
                      {__$$eval(() => this.state?.record?.name || '-')}
                    </Typography.Text>
                    <Typography.Text
                      style={{ fontSize: '' }}
                      strong={false}
                      disabled={false}
                      ellipsis={true}
                      __component_name="Typography.Text"
                    >
                      {this.i18n('i18n-xwmo3gdd') /* 吗？ */}
                    </Typography.Text>
                  </Space>
                </Col>
              </Row>
            }
            showIcon={true}
            __component_name="Alert"
          />
          <FormilyForm
            ref={this._refsManager.linkRef('formily_delete_repo')}
            componentProps={{
              colon: false,
              layout: 'horizontal',
              labelCol: 4,
              labelAlign: 'left',
              wrapperCol: 20,
            }}
            __component_name="FormilyForm"
          >
            <FormilyCheckbox
              fieldProps={{
                enum: [
                  {
                    label: this.i18n('i18n-hd27um9e') /* 同步删除当前仓库的所有发布记录 */,
                    value: 'true',
                  },
                ],
                name: 'record',
                title: '',
                'x-validator': [],
              }}
              componentProps={{ 'x-component-props': { _sdkSwrGetFunc: {} } }}
              __component_name="FormilyCheckbox"
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
                children: null,
              },
              {
                key: 'tab-item-2',
                label: this.i18n('i18n-ptgr3r7b') /* 组件仓库管理 */,
                children: (
                  <Row wrap={true} gutter={[0, 0]} __component_name="Row">
                    <Col span={24} __component_name="Col">
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
                                    return this.openAddRepoModal.apply(
                                      this,
                                      Array.prototype.slice.call(arguments).concat([])
                                    );
                                  }.bind(this)}
                                  disabled={__$$eval(() => !this.canEditAppPublish())}
                                  __component_name="Button"
                                >
                                  {this.i18n('i18n-gklza56m') /* 添加组件仓库 */}
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
                                    return this.handleRefreshRepo.apply(
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
                                    return this.handleRepoSearvhValueChange.apply(
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
                                title: this.i18n('i18n-twtfn0kc') /* 组件仓库名称 */,
                                dataIndex: 'name',
                              },
                              {
                                key: 'status',
                                title: this.i18n('i18n-ct3q2502') /* 当前状态 */,
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
                                filters: __$$eval(() => this.utils.getChannelStatus(this)),
                                dataIndex: 'status',
                              },
                              {
                                key: 'url',
                                title: this.i18n('i18n-11r38hcr') /* 组件仓库地址 */,
                                dataIndex: __$$eval(() => ['detail', 'url']),
                              },
                              {
                                title: this.i18n('i18n-uvtyr9de') /* 更新者 */,
                                dataIndex: __$$eval(() => ['updator', 'name']),
                              },
                              {
                                key: '',
                                title: this.i18n('i18n-d2brlroc') /* 更新时间 */,
                                render: (text, record, index) =>
                                  (__$$context => (
                                    <Typography.Time
                                      time={__$$eval(() => text)}
                                      format=""
                                      relativeTime={true}
                                    />
                                  ))(__$$createChildContext(__$$context, { text, record, index })),
                                sorter: true,
                                dataIndex: 'updateAt',
                              },
                              {
                                title: this.i18n('i18n-uel9pjrj') /* 操作 */,
                                width: 150,
                                render: (text, record, index) =>
                                  (__$$context => (
                                    <Space
                                      align="center"
                                      direction="horizontal"
                                      __component_name="Space"
                                    >
                                      {!!__$$eval(
                                        () => !(!__$$context.isSystemAdmin() && record.builtIn)
                                      ) && (
                                        <Button
                                          block={false}
                                          ghost={false}
                                          shape="default"
                                          danger={false}
                                          onClick={function () {
                                            return this.openModal.apply(
                                              this,
                                              Array.prototype.slice.call(arguments).concat([
                                                {
                                                  record: record,
                                                  type: 'editRepo',
                                                },
                                              ])
                                            );
                                          }.bind(__$$context)}
                                          disabled={__$$eval(
                                            () => !__$$context.canEditAppPublish()
                                          )}
                                          __component_name="Button"
                                        >
                                          {this.i18n('i18n-ynxzg8x9') /* 编辑 */}
                                        </Button>
                                      )}
                                      {!!__$$eval(
                                        () => !__$$context.isSystemAdmin() && record.builtIn
                                      ) && (
                                        <Button
                                          block={false}
                                          ghost={false}
                                          shape="default"
                                          danger={false}
                                          onClick={function () {
                                            return this.openModal.apply(
                                              this,
                                              Array.prototype.slice.call(arguments).concat([
                                                {
                                                  record: record,
                                                  type: 'detailRepo',
                                                },
                                              ])
                                            );
                                          }.bind(__$$context)}
                                          disabled={false}
                                          __component_name="Button"
                                        >
                                          {this.i18n('i18n-duipg1h3') /* 查看 */}
                                        </Button>
                                      )}
                                      <Tooltip
                                        title={__$$eval(
                                          () =>
                                            !__$$context.isSystemAdmin() &&
                                            record.builtIn &&
                                            __$$context.i18n('i18n-2n1c4oog')
                                        )}
                                        __component_name="Tooltip"
                                      >
                                        <Button
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
                                                  type: 'deleteRepo',
                                                },
                                              ])
                                            );
                                          }.bind(__$$context)}
                                          disabled={__$$eval(
                                            () =>
                                              !__$$context.canEditAppPublish() ||
                                              (!__$$context.isSystemAdmin() && record.builtIn)
                                          )}
                                          __component_name="Button"
                                        >
                                          {this.i18n('i18n-it3zdrk8') /* 删除 */}
                                        </Button>
                                      </Tooltip>
                                    </Space>
                                  ))(__$$createChildContext(__$$context, { text, record, index })),
                                dataIndex: 'op',
                              },
                            ]}
                            loading={__$$eval(() => this.props.useGetAppPublishChannels?.loading)}
                            onChange={function () {
                              return this.handleRepoTableChange.apply(
                                this,
                                Array.prototype.slice.call(arguments).concat([])
                              );
                            }.bind(this)}
                            dataSource={__$$eval(() => this.getRepoData()?.data)}
                            pagination={{
                              size: 'default',
                              total: __$$eval(() => this.getRepoData()?.total),
                              simple: false,
                              current: __$$eval(() => this.state.repoCurrent),
                              onChange: function () {
                                return this.handleRepoPaginationChange.apply(
                                  this,
                                  Array.prototype.slice.call(arguments).concat([])
                                );
                              }.bind(this),
                              pageSize: __$$eval(() => this.state.repoSize),
                              showQuickJumper: false,
                              showSizeChanger: false,
                              onShowSizeChange: function () {
                                return this.handleRepoPaginationChange.apply(
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
            defaultActiveKey="tab-item-2"
            destroyInactiveTabPane="true"
          />
        </Card>
      </Page>
    );
  }
}

const PageWrapper = () => {
  const location = useLocation();
  const history = getUnifiedHistory();
  const match = matchPath({ path: '/apps/:appId/publish-channels' }, location.pathname);
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
        {
          func: 'useGetAppPublishChannels',
          params: function applyThis() {
            return {
              id: this.match?.params?.appId,
            };
          }.apply(self),
          enableLocationSearch: function applyThis() {
            return true;
          }.apply(self),
        },
      ]}
      render={dataProps => (
        <AppPublishChannels$$Page {...dataProps} self={self} appHelper={appHelper} />
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
