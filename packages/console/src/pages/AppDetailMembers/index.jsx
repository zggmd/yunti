// 注意: 出码引擎注入的临时变量默认都以 "__$$" 开头，禁止在搭建的代码中直接访问。
// 例外：react 框架的导出名和各种组件名除外。
import React from 'react';

import {
  Page,
  Modal,
  FormilyForm,
  FormilySelect,
  Alert,
  Row,
  Col,
  Typography,
  Card,
  Space,
  Button,
  Input,
  Table,
} from '@tenx-ui/materials';

import { AntdIconPlusOutlined, AntdIconReloadOutlined } from '@tenx-ui/icon-materials';

import { useLocation, matchPath } from '@umijs/max';
import DataProvider from '../../components/DataProvider';
import qs from 'query-string';
import { getUnifiedHistory } from '@tenx-ui/utils/es/UnifiedLink/index.prod';

import utils, { RefsManager } from '../../utils/__utils';

import * as __$$i18n from '../../i18n';

import __$$constants from '../../__constants';

import './index.css';

class AppDetailMembers$$Page extends React.Component {
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
      appMemberToBeRemoved: undefined,
      addAppMemberModalOpen: false,
      removeAppMemberConfirmModalOpen: false,
    };
  }

  $ = refName => {
    return this._refsManager.get(refName);
  };

  $$ = refName => {
    return this._refsManager.getAll(refName);
  };

  handleRefresh() {
    this.props.useGetApp?.mutate();
  }

  canEditAppMembers() {
    const currentUser = this.props.useGetCurrentUser?.data?.currentUser;
    return (
      currentUser?.role === 'SystemAdmin' ||
      ['Owner', 'Maintainer'].includes(
        this.props.useGetApp?.data?.app?.members.find(m => m.member.id === currentUser.id)?.role
      )
    );
  }

  handleQueryChange() {
    const {} = this.state.filters || {};
    const params = {};
    this.utils?.changeLocationQuery(this, 'useGetApp', params);
  }

  handleTableChange(pagination, filters, sorter, extra) {
    this.setState(
      {
        pagination,
        filters,
        sorter,
      },
      this.handleQueryChange
    );
  }

  async confirmAddAppMember(e) {
    const form = this.$('add_member_form')?.formRef?.current?.form;
    return form.submit(async values => {
      values.appId = this.match.params.appId;
      try {
        await this.utils.bff.addAppMember({
          appMember: values,
        });
        this.closeAddAppMemberModal();
        this.utils.notification.success({
          message: '成员添加成功',
        });
        this.props.useGetApp.mutate();
      } catch (error) {
        this.utils.notification.warnings({
          message: '成员添加失败',
          errors: error?.response?.errors,
        });
      }
    });
  }

  paginationShowTotal(total, range) {
    return `${this.i18n('i18n-unauzwfe')} ${total} ${this.i18n('i18n-wkyhbxzj')}`;
  }

  openAddAppMemberModal() {
    this.setState({
      addAppMemberModalOpen: true,
    });
  }

  closeAddAppMemberModal() {
    this.setState({
      addAppMemberModalOpen: false,
    });
  }

  async confirmRemoveAppMember() {
    await this.utils.bff.removeAppMember({
      appId: this.match.params.appId,
      userId: this.state.appMemberToBeRemoved.member.id,
    });
    this.closeRemoveAppMemberConfirmModal();
    this.utils.notification.success({
      message: `成员 ${this.state.appMemberToBeRemoved.member.name} 移除成功`,
    });
    this.setState({
      appMemberToBeRemoved: undefined,
    });
    this.props.useGetApp.mutate();
  }

  handlePaginationChange(c, s) {
    this.setState(
      {
        size: s,
        current: c,
      },
      this.handleQueryChange
    );
  }

  openRemoveAppMemberConfirmModal(e, record) {
    this.setState({
      removeAppMemberConfirmModalOpen: true,
      appMemberToBeRemoved: record,
    });
  }

  closeRemoveAppMemberConfirmModal() {
    this.setState({
      removeAppMemberConfirmModalOpen: false,
    });
  }

  componentDidMount() {}

  render() {
    const __$$context = this._context || this;
    const { state } = __$$context;
    return (
      <Page>
        <Modal
          mask={true}
          onOk={function () {
            return this.confirmAddAppMember.apply(
              this,
              Array.prototype.slice.call(arguments).concat([])
            );
          }.bind(this)}
          open={__$$eval(() => this.state.addAppMemberModalOpen)}
          title={this.i18n('i18n-aceiy2fy') /* 添加成员 */}
          okType="primary"
          centered={false}
          keyboard={true}
          onCancel={function () {
            return this.closeAddAppMemberModal.apply(
              this,
              Array.prototype.slice.call(arguments).concat([])
            );
          }.bind(this)}
          forceRender={false}
          maskClosable={false}
          confirmLoading={false}
          destroyOnClose={true}
          __component_name="Modal"
        >
          <FormilyForm
            ref={this._refsManager.linkRef('add_member_form')}
            componentProps={{
              colon: false,
              layout: 'horizontal',
              labelCol: 4,
              labelAlign: 'left',
              wrapperCol: 20,
            }}
            __component_name="FormilyForm"
          >
            <FormilySelect
              fieldProps={{
                name: 'userId',
                title: this.i18n('i18n-vc1z00ab') /* 成员名 */,
                required: true,
                'x-validator': [],
              }}
              componentProps={{
                'x-component-props': {
                  disabled: false,
                  allowClear: false,
                  placeholder: '请选择',
                  _sdkSwrGetFunc: {
                    func: __$$eval(() => this.utils.bff.getUsers),
                    label: 'name',
                    value: 'id',
                    params: [],
                    resKey: 'users',
                  },
                },
              }}
              __component_name="FormilySelect"
            />
            <FormilySelect
              fieldProps={{
                name: 'role',
                title: this.i18n('i18n-xvkn1o65') /* 角色 */,
                required: true,
                'x-validator': [],
              }}
              componentProps={{
                'x-component-props': {
                  enum: [
                    {
                      label: this.i18n('i18n-wtpamquq') /* 访客 */,
                      value: 'Guest',
                      disabled: false,
                    },
                    {
                      label: this.i18n('i18n-t3krslmt') /* 测试 */,
                      value: 'Reporter',
                      disabled: false,
                    },
                    {
                      label: this.i18n('i18n-0g29qv4h') /* 开发者 */,
                      value: 'Developer',
                      disabled: false,
                    },
                    {
                      label: this.i18n('i18n-07elef67') /* 维护者 */,
                      value: 'Maintainer',
                      disabled: false,
                    },
                    {
                      label: this.i18n('i18n-s4uc3qfq') /* 拥有者 */,
                      value: 'Owner',
                      disabled: __$$eval(
                        () =>
                          this.props.useGetCurrentUser?.data?.currentUser?.role !== 'SystemAdmin'
                      ),
                    },
                  ],
                  disabled: false,
                  allowClear: false,
                  placeholder: '请选择',
                  _sdkSwrGetFunc: { params: [] },
                },
              }}
              __component_name="FormilySelect"
            />
          </FormilyForm>
        </Modal>
        <Modal
          mask={true}
          onOk={function () {
            return this.confirmRemoveAppMember.apply(
              this,
              Array.prototype.slice.call(arguments).concat([])
            );
          }.bind(this)}
          open={__$$eval(() => this.state.removeAppMemberConfirmModalOpen)}
          title="确认移除成员"
          centered={false}
          keyboard={true}
          onCancel={function () {
            return this.closeRemoveAppMemberConfirmModal.apply(
              this,
              Array.prototype.slice.call(arguments).concat([])
            );
          }.bind(this)}
          forceRender={false}
          maskClosable={false}
          confirmLoading={false}
          destroyOnClose={true}
          __component_name="Modal"
        >
          <Alert
            type="warning"
            message={__$$eval(
              () => `确定移除成员 ${this.state.appMemberToBeRemoved?.member?.name} 吗？`
            )}
            showIcon={true}
            __component_name="Alert"
          />
        </Modal>
        <Row wrap={true} __component_name="Row">
          <Col span={24} __component_name="Col">
            <Typography.Title
              bold={true}
              level={1}
              bordered={false}
              ellipsis={true}
              __component_name="Typography.Title"
            >
              {this.i18n('i18n-4sb1nxis') /* 成员管理 */}
            </Typography.Title>
          </Col>
          <Col span={24} __component_name="Col">
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
              <Space
                align="center"
                style={{ zIndex: '1', position: 'relative' }}
                direction="horizontal"
                __component_name="Space"
              >
                <Button
                  icon={<AntdIconPlusOutlined __component_name="AntdIconPlusOutlined" />}
                  type="primary"
                  block={false}
                  ghost={false}
                  shape="default"
                  danger={false}
                  onClick={function () {
                    return this.openAddAppMemberModal.apply(
                      this,
                      Array.prototype.slice.call(arguments).concat([])
                    );
                  }.bind(this)}
                  disabled={__$$eval(() => !this.canEditAppMembers())}
                  __component_name="Button"
                >
                  {this.i18n('i18n-aceiy2fy') /* 添加成员 */}
                </Button>
                <Button
                  icon={<AntdIconReloadOutlined __component_name="AntdIconReloadOutlined" />}
                  block={false}
                  ghost={false}
                  shape="default"
                  danger={false}
                  onClick={function () {
                    return this.handleRefresh.apply(
                      this,
                      Array.prototype.slice.call(arguments).concat([])
                    );
                  }.bind(this)}
                  disabled={false}
                  __component_name="Button"
                >
                  {this.i18n('i18n-52w3n9hq') /* 刷新 */}
                </Button>
                <Input.Search
                  onChange={function () {
                    return this.handleNodeSearchValueChange.apply(
                      this,
                      Array.prototype.slice.call(arguments).concat([])
                    );
                  }.bind(this)}
                  placeholder={this.i18n('i18n-sk2miz3l') /* 输入成员名搜索 */}
                  __component_name="Input.Search"
                />
              </Space>
              <Table
                size="default"
                style={{ marginTop: '-45px' }}
                rowKey={row => row.member.id}
                scroll={{ scrollToFirstRowOnChange: true }}
                columns={[
                  {
                    key: '',
                    title: this.i18n('i18n-vc1z00ab') /* 成员名 */,
                    dataIndex: __$$eval(() => ['member', 'name']),
                  },
                  {
                    key: '',
                    title: this.i18n('i18n-xvkn1o65') /* 角色 */,
                    render: '',
                    dataIndex: 'role',
                  },
                  {
                    key: '',
                    title: this.i18n('i18n-90ht7c6d') /* 加入时间 */,
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
                            return this.openRemoveAppMemberConfirmModal.apply(
                              this,
                              Array.prototype.slice.call(arguments).concat([record])
                            );
                          }.bind(__$$context)}
                          disabled={__$$eval(() => !__$$context.canEditAppMembers())}
                          __component_name="Button"
                        >
                          {this.i18n('i18n-x0whqlmr') /* 移除成员 */}
                        </Button>
                      ))(__$$createChildContext(__$$context, { text, record, index })),
                    dataIndex: 'op',
                  },
                ]}
                loading={__$$eval(() => this.props.useGetApp?.loading)}
                onChange={function () {
                  return this.handleNodeTableChange.apply(
                    this,
                    Array.prototype.slice.call(arguments).concat([])
                  );
                }.bind(this)}
                dataSource={__$$eval(() => this.props.useGetApp?.data?.app?.members || [])}
                pagination={{
                  size: 'default',
                  total: __$$eval(() => this.props.useGetApp?.data?.app?.members?.length || 0),
                  simple: true,
                  current: 1,
                  onChange: function () {
                    return this.handleNodePaginationChange.apply(
                      this,
                      Array.prototype.slice.call(arguments).concat([])
                    );
                  }.bind(this),
                  pageSize: 10,
                  position: ['topRight'],
                  showTotal: function () {
                    return this.paginationShowTotal.apply(
                      this,
                      Array.prototype.slice.call(arguments).concat([])
                    );
                  }.bind(this),
                  showQuickJumper: false,
                  showSizeChanger: false,
                  onShowSizeChange: function () {
                    return this.handleNodePaginationChange.apply(
                      this,
                      Array.prototype.slice.call(arguments).concat([])
                    );
                  }.bind(this),
                }}
                showHeader={true}
                __component_name="Table"
              />
            </Card>
          </Col>
        </Row>
      </Page>
    );
  }
}

const PageWrapper = () => {
  const location = useLocation();
  const history = getUnifiedHistory();
  const match = matchPath({ path: '/apps/:appId/members' }, location.pathname);
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
        <AppDetailMembers$$Page {...dataProps} self={self} appHelper={appHelper} />
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
