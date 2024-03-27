// 注意: 出码引擎注入的临时变量默认都以 "__$$" 开头，禁止在搭建的代码中直接访问。
// 例外：react 框架的导出名和各种组件名除外。
import React from 'react';

import {
  Page,
  Modal,
  FormilyForm,
  FormilySelect,
  FormilyInput,
  Alert,
  Row,
  Col,
  Card,
  Tabs,
  Space,
  Button,
  Input,
  Table,
  Typography,
} from '@tenx-ui/materials';

import { AntdIconPlusOutlined, AntdIconReloadOutlined } from '@tenx-ui/icon-materials';

import { useLocation, matchPath } from '@umijs/max';
import { DataProvider } from 'shared-components';
import qs from 'query-string';
import { getUnifiedHistory } from '@tenx-ui/utils/es/UnifiedLink/index.prod';

import utils, { RefsManager } from '../../utils/__utils';

import * as __$$i18n from '../../i18n';

import __$$constants from '../../__constants';

import './index.css';

class AppDetailBranches$$Page extends React.Component {
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
      appBranchToBeRemoved: undefined,
      checkoutAppBranchModalOpen: false,
      pageId: undefined,
      removeAppBranchConfirmModalOpen: false,
    };
  }

  $ = refName => {
    return this._refsManager.get(refName);
  };

  $$ = refName => {
    return this._refsManager.getAll(refName);
  };

  canCheckoutAppBranch() {
    const currentUser = this.props.useGetCurrentUser?.data?.currentUser;
    return (
      currentUser?.role === 'SystemAdmin' ||
      ['Owner', 'Maintainer', 'Developer'].includes(
        this.props.useGetApp?.data?.app?.members.find(m => m.member.id === currentUser.id)?.role
      )
    );
  }

  closeCheckoutAppBranchModal() {
    this.setState({
      checkoutAppBranchModalOpen: false,
    });
  }

  closeRemoveAppBranchConfirmModal() {
    this.setState({
      removeAppBranchConfirmModalOpen: false,
    });
  }

  async confirmCheckoutAppBranch(e) {
    const form = this.$('checkout_branch_form')?.formRef?.current?.form;
    return form.submit(async values => {
      values.appId = this.match.params.appId;
      try {
        await this.utils.bff.checkoutNewBranchForApp({
          branch: values,
        });
        this.closeCheckoutAppBranchModal();
        this.utils.notification.success({
          message: '分支创建成功',
        });
        this.props.useGetApp.mutate();
      } catch (error) {
        this.utils.notification.warnings({
          message: '分支创建失败',
          errors: error?.response?.errors,
        });
      }
    });
  }

  async confirmRemoveAppBranch() {
    await this.utils.bff.deleteBranchForApp({
      name: this.state.appBranchToBeRemoved.name,
    });
    this.closeRemoveAppBranchConfirmModal();
    this.utils.notification.success({
      message: `分支 ${this.state.appBranchToBeRemoved.displayName} 删除成功`,
    });
    this.setState({
      appBranchToBeRemoved: undefined,
    });
    this.props.useGetApp.mutate();
  }

  getTableDataSource() {
    const branches = this.props.useGetApp?.data?.app?.branches || [];
    const { searchText } = this.state;
    if (!searchText) {
      return branches;
    }
    console.log('branches', branches);
    console.log('searchText', searchText);
    return branches.filter(branch =>
      branch.displayName.toLowerCase().includes(searchText.toLowerCase())
    );
  }

  handleRefresh() {
    this.props.useGetApp?.mutate();
  }

  onSearch(value) {
    this.setState({
      searchText: value,
    });
  }

  onTabChange(key) {
    console.log(key, this, this.match);
    if (key === 'merge') {
      this.appHelper.history.push(`/apps/${this.match.params.appId}/merge`);
    }
  }

  openCheckoutAppBranchModal() {
    this.setState({
      checkoutAppBranchModalOpen: true,
    });
  }

  openRemoveAppBranchConfirmModal(e, record) {
    this.setState({
      removeAppBranchConfirmModalOpen: true,
      appBranchToBeRemoved: record,
    });
  }

  paginationShowTotal(total, range) {
    return `共计 ${total} 条`;
  }

  componentDidMount() {}

  render() {
    const __$$context = this._context || this;
    const { state } = __$$context;
    return (
      <Page>
        <Modal
          __component_name="Modal"
          centered={false}
          confirmLoading={false}
          destroyOnClose={true}
          forceRender={false}
          keyboard={true}
          mask={true}
          maskClosable={false}
          okType="primary"
          onCancel={function () {
            return this.closeCheckoutAppBranchModal.apply(
              this,
              Array.prototype.slice.call(arguments).concat([])
            );
          }.bind(this)}
          onOk={function () {
            return this.confirmCheckoutAppBranch.apply(
              this,
              Array.prototype.slice.call(arguments).concat([])
            );
          }.bind(this)}
          open={__$$eval(() => this.state.checkoutAppBranchModalOpen)}
          title={this.i18n('i18n-b2ei9j2f') /* 创建分支 */}
        >
          <FormilyForm
            __component_name="FormilyForm"
            componentProps={{
              colon: false,
              labelAlign: 'left',
              labelCol: 4,
              layout: 'horizontal',
              wrapperCol: 20,
            }}
            ref={this._refsManager.linkRef('checkout_branch_form')}
          >
            <FormilySelect
              __component_name="FormilySelect"
              componentProps={{
                'x-component-props': {
                  _sdkSwrGetFunc: {
                    func: __$$eval(() => this.utils.bff.getApp),
                    label: 'displayName',
                    params: [
                      {
                        _unsafe_MixedSetter_value_select: 'ExpressionSetter',
                        key: 'id',
                        value: __$$eval(() => this.match?.params?.appId),
                      },
                    ],
                    resKey: __$$eval(() => ['app', 'branches']),
                    value: 'name',
                  },
                  _unsafe_MixedSetter_enum_select: 'StringSetter',
                  allowClear: false,
                  disabled: false,
                  placeholder: '请选择',
                },
              }}
              fieldProps={{
                'name': 'sourceName',
                'required': true,
                'title': this.i18n('i18n-kzc8hlof') /* 源分支 */,
                'x-validator': [],
              }}
            />
            <FormilyInput
              __component_name="FormilyInput"
              componentProps={{ 'x-component-props': { placeholder: '请输入' } }}
              fieldProps={{
                'name': 'name',
                'title': this.i18n('i18n-mocj3t8i') /* 新分支名 */,
                'x-validator': [],
              }}
            />
          </FormilyForm>
        </Modal>
        <Modal
          __component_name="Modal"
          centered={false}
          confirmLoading={false}
          destroyOnClose={true}
          forceRender={false}
          keyboard={true}
          mask={true}
          maskClosable={false}
          onCancel={function () {
            return this.closeRemoveAppBranchConfirmModal.apply(
              this,
              Array.prototype.slice.call(arguments).concat([])
            );
          }.bind(this)}
          onOk={function () {
            return this.confirmRemoveAppBranch.apply(
              this,
              Array.prototype.slice.call(arguments).concat([])
            );
          }.bind(this)}
          open={__$$eval(() => this.state.removeAppBranchConfirmModalOpen)}
          title="确认移除成员"
        >
          <Alert
            __component_name="Alert"
            message={__$$eval(
              () =>
                `确定删除分支 ${this.state.appBranchToBeRemoved?.displayName} (${this.state.appBranchToBeRemoved?.name}) 吗？`
            )}
            showIcon={true}
            type="warning"
          />
        </Modal>
        <Row __component_name="Row" wrap={true}>
          <Col __component_name="Col" span={24}>
            <Card
              __component_name="Card"
              actions={[]}
              bordered={false}
              hoverable={false}
              loading={false}
              size="default"
              style={{}}
              type="default"
            >
              <Tabs
                __component_name="Tabs"
                activeKey=""
                destroyInactiveTabPane="true"
                items={[
                  { key: 'branch', label: '分支管理' },
                  { key: 'merge', label: '合并请求' },
                ]}
                onTabClick={function () {
                  return this.onTabChange.apply(
                    this,
                    Array.prototype.slice.call(arguments).concat([])
                  );
                }.bind(this)}
                size="large"
                style={{ marginTop: '-20px' }}
                tabPosition="top"
                type="line"
              />
              <Space
                __component_name="Space"
                align="center"
                direction="horizontal"
                style={{ position: 'relative', zIndex: '1' }}
              >
                <Button
                  __component_name="Button"
                  block={false}
                  danger={false}
                  disabled={__$$eval(() => !this.canCheckoutAppBranch())}
                  ghost={false}
                  icon={<AntdIconPlusOutlined __component_name="AntdIconPlusOutlined" />}
                  onClick={function () {
                    return this.openCheckoutAppBranchModal.apply(
                      this,
                      Array.prototype.slice.call(arguments).concat([])
                    );
                  }.bind(this)}
                  shape="default"
                  type="primary"
                >
                  {this.i18n('i18n-b2ei9j2f') /* 创建分支 */}
                </Button>
                <Button
                  __component_name="Button"
                  block={false}
                  danger={false}
                  disabled={false}
                  ghost={false}
                  icon={<AntdIconReloadOutlined __component_name="AntdIconReloadOutlined" />}
                  onClick={function () {
                    return this.handleRefresh.apply(
                      this,
                      Array.prototype.slice.call(arguments).concat([])
                    );
                  }.bind(this)}
                  shape="default"
                >
                  刷新
                </Button>
                <Input.Search
                  __component_name="Input.Search"
                  onSearch={function () {
                    return this.onSearch.apply(
                      this,
                      Array.prototype.slice.call(arguments).concat([])
                    );
                  }.bind(this)}
                  placeholder="输入分支名搜索"
                />
              </Space>
              <Table
                __component_name="Table"
                columns={[
                  { dataIndex: 'displayName', title: this.i18n('i18n-na2etfio') /* 名称 */ },
                  {
                    dataIndex: 'name',
                    key: '',
                    title: this.i18n('i18n-xm8m9oms') /* 完整分支名 */,
                  },
                  {
                    dataIndex: 'hash',
                    key: '',
                    render: '',
                    title: this.i18n('i18n-58purxk8') /* 最后的提交 */,
                  },
                  { dataIndex: 'committer', title: this.i18n('i18n-gnabgk8z') /* 提交人 */ },
                  { dataIndex: 'message', title: this.i18n('i18n-sivgv5vw') /* 提交信息 */ },
                  {
                    dataIndex: 'date',
                    key: '',
                    render: (text, record, index) =>
                      (__$$context => (
                        <Typography.Time
                          format=""
                          relativeTime={true}
                          time={__$$eval(() => text)}
                        />
                      ))(__$$createChildContext(__$$context, { text, record, index })),
                    sorter: true,
                    title: this.i18n('i18n-d2brlroc') /* 更新时间 */,
                  },
                  {
                    dataIndex: 'op',
                    render: /* 插槽容器*/ (text, record, index) =>
                      (__$$context => (
                        <Button
                          __component_name="Button"
                          block={false}
                          danger={true}
                          disabled={false}
                          ghost={false}
                          onClick={function () {
                            return this.openRemoveAppBranchConfirmModal.apply(
                              this,
                              Array.prototype.slice.call(arguments).concat([record])
                            );
                          }.bind(__$$context)}
                          shape="default"
                          type="default"
                        >
                          删除分支
                        </Button>
                      ))(__$$createChildContext(__$$context, { text, record, index })),
                    title: this.i18n('i18n-uel9pjrj') /* 操作 */,
                  },
                ]}
                dataSource={__$$eval(() => this.getTableDataSource())}
                loading={__$$eval(() => this.props.useGetApp?.loading)}
                pagination={{
                  pageSize: 15,
                  pagination: { pageSize: 10 },
                  position: ['topRight'],
                  showQuickJumper: false,
                  showSizeChanger: false,
                  showTotal: function () {
                    return this.paginationShowTotal.apply(
                      this,
                      Array.prototype.slice.call(arguments).concat([])
                    );
                  }.bind(this),
                  simple: true,
                  size: 'default',
                  total: __$$eval(() => this.props.useGetApp?.data?.app?.branches?.length || 0),
                }}
                rowKey="name"
                scroll={{ scrollToFirstRowOnChange: true }}
                showHeader={true}
                size="default"
                style={{ marginTop: '-45px' }}
              />
            </Card>
          </Col>
        </Row>
      </Page>
    );
  }
}

const PageWrapper = (props = {}) => {
  const location = useLocation();
  const history = getUnifiedHistory();
  const match = matchPath({ path: '/apps/:appId/branches' }, location.pathname);
  history.match = match;
  history.query = qs.parse(location.search);
  const appHelper = {
    utils,
    constants: __$$constants,
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
          func: 'useGetApp',
          params: function applyThis() {
            return {
              id: this.match?.params?.appId,
            };
          }.apply(self),
          enableLocationSearch: undefined,
        },
        {
          func: 'useGetCurrentUser',
          params: undefined,
          enableLocationSearch: undefined,
        },
      ]}
      render={dataProps => (
        <AppDetailBranches$$Page {...props} {...dataProps} self={self} appHelper={appHelper} />
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
    // 重写 state getter，保证 state 的指向不变，这样才能从 context 中拿到最新的 state
    get state() {
      return oldContext.state;
    },
    // 重写 props getter，保证 props 的指向不变，这样才能从 context 中拿到最新的 props
    get props() {
      return oldContext.props;
    },
  };
  childContext.__proto__ = oldContext;
  return childContext;
}
