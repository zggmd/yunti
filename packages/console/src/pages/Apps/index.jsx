// 注意: 出码引擎注入的临时变量默认都以 "__$$" 开头，禁止在搭建的代码中直接访问。
// 例外：react 框架的导出名和各种组件名除外。
import React from 'react';

import {
  Page,
  Modal,
  FormilyForm,
  FormilyInput,
  Row,
  Col,
  Typography,
  Card,
  Space,
  Button,
  Input,
  Table,
  UnifiedLink,
  Dropdown,
} from '@tenx-ui/materials';

import {
  AntdIconPlusOutlined,
  AntdIconReloadOutlined,
  AntdIconDownOutlined,
} from '@tenx-ui/icon-materials';

import { useLocation, matchPath } from '@umijs/max';
import DataProvider from '../../components/DataProvider';
import qs from 'query-string';
import { getUnifiedHistory } from '@tenx-ui/utils/es/UnifiedLink/index.prod';

import utils, { RefsManager } from '../../utils/__utils';

import * as __$$i18n from '../../i18n';

import __$$constants from '../../__constants';

import './index.css';

class Apps$$Page extends React.Component {
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
      size: 10,
      sorter: undefined,
      current: 1,
      filters: undefined,
      searchKey: 'name',
      pagination: undefined,
      searchValue: undefined,
      createAppModalOpen: false,
      updateAppModalOpen: false,
      createAppModalConfirmLoading: false,
      updateAppModalConfirmLoading: false,
    };
  }

  $ = refName => {
    return this._refsManager.get(refName);
  };

  $$ = refName => {
    return this._refsManager.getAll(refName);
  };

  goPage(e, { page, record }) {
    this.history.push(`${this.location.pathname}/${record.id}/${page}`);
  }

  menuOnClick(e, record) {
    switch (e.key) {
      // case 'pages':
      // case 'members': {
      //   return this.history.push(`${this.location.pathname}/${record.id}/${e.key}`)
      // }
      case 'props': {
        this.openUpdateAppModal(e, record);
      }
      default: {
        break;
      }
    }
  }

  handleRefresh() {
    this.props.useGetCurrentUserApps?.mutate();
  }

  confirmCreateApp(e) {
    const form = this.$('create_app_form')?.formRef?.current?.form;
    form.submit(async values => {
      console.log('values', values);
      this.setState({
        createAppModalConfirmLoading: true,
      });
      try {
        await this.utils.bff.createApp({
          app: values,
        });
        this.closeCreateAppModal();
        this.utils.notification.success({
          message: '创建应用成功',
        });
        this.props.useGetCurrentUserApps.mutate();
      } catch (error) {
        this.utils.notification.warnings({
          message: '创建应用失败',
          errors: error?.response?.errors,
        });
      } finally {
        this.setState({
          createAppModalConfirmLoading: false,
        });
      }
    });
  }

  confirmUpdateApp(e) {
    const form = this.$('update_app_form')?.formRef?.current?.form;
    form.submit(async values => {
      this.setState({
        updateAppModalConfirmLoading: true,
      });
      try {
        delete values.namespace;
        await this.utils.bff.updateApp({
          app: values,
        });
        this.closeCreateAppModal();
        this.utils.notification.success({
          message: '更新应用属性成功',
        });
        this.props.useGetCurrentUserApps.mutate();
      } catch (error) {
        this.utils.notification.warnings({
          message: '更新应用属性失败',
          errors: error?.response?.errors,
        });
      } finally {
        this.setState({
          updateAppModalConfirmLoading: false,
        });
      }
    });
  }

  handleQueryChange() {
    const {} = this.state.filters || {};
    const params = {};
    this.utils?.changeLocationQuery(this, 'useGetCurrentUserApps', params);
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

  openCreateAppModal(e) {
    this.setState({
      createAppModalOpen: true,
    });
  }

  openUpdateAppModal(e, record) {
    this.setState(
      {
        updateAppModalOpen: true,
      },
      async () => {
        await this.utils.sleep(1);
        const form = this.$('update_app_form')?.formRef?.current?.form;
        form.reset();
        form.setValues({
          id: record.id,
          namespace: record.namespace,
          name: record.name,
          description: record.description,
        });
      }
    );
  }

  closeCreateAppModal() {
    this.setState({
      createAppModalOpen: false,
    });
  }

  closeUpdateAppModal() {
    this.setState({
      updateAppModalOpen: false,
    });
  }

  paginationShowTotal(total, range) {
    return `${this.i18n('i18n-unauzwfe')} ${total} ${this.i18n('i18n-wkyhbxzj')}`;
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

  componentDidMount() {}

  render() {
    const __$$context = this._context || this;
    const { state } = __$$context;
    return (
      <Page>
        <Modal
          ref={this._refsManager.linkRef('modal-773f7186')}
          mask={true}
          onOk={function () {
            return this.confirmCreateApp.apply(
              this,
              Array.prototype.slice.call(arguments).concat([])
            );
          }.bind(this)}
          open={__$$eval(() => this.state.createAppModalOpen)}
          title={this.i18n('i18n-cdepvr38') /* 新增应用 */}
          centered={false}
          keyboard={true}
          onCancel={function () {
            return this.closeCreateAppModal.apply(
              this,
              Array.prototype.slice.call(arguments).concat([])
            );
          }.bind(this)}
          forceRender={false}
          maskClosable={false}
          confirmLoading={__$$eval(() => this.state.createAppModalConfirmLoading)}
          destroyOnClose={true}
          __component_name="Modal"
        >
          <FormilyForm
            ref={this._refsManager.linkRef('create_app_form')}
            componentProps={{
              colon: false,
              layout: 'horizontal',
              labelCol: 4,
              labelAlign: 'left',
              wrapperCol: 20,
            }}
            __component_name="FormilyForm"
          >
            <FormilyInput
              fieldProps={{
                name: 'name',
                title: this.i18n('i18n-iiikgh5p') /* 应用名称 */,
                required: true,
                description: this.i18n('i18n-lh9r0aur') /* 名称不能跟其他应用重复 */,
                'x-validator': [
                  {
                    id: 'disabled',
                    icon: 'tenx-ui-icon:Circle',
                    type: 'disabled',
                    children: '未知',
                  },
                ],
              }}
              componentProps={{ 'x-component-props': { placeholder: '请输入' } }}
              __component_name="FormilyInput"
            />
            <FormilyInput
              fieldProps={{
                name: 'namespace',
                title: this.i18n('i18n-rai2jazr') /* 命名空间 */,
                required: true,
                description: this.i18n('i18n-6me4bk3g') /* 应用的唯一标识，创建后不能修改 */,
                'x-validator': [
                  {
                    id: 'disabled',
                    icon: 'tenx-ui-icon:Circle',
                    type: 'disabled',
                    message:
                      this.i18n(
                        'i18n-zbrcaqqo'
                      ) /* 应用命名空间只能包含字母、数字、下划线 '_'、短横  '-'  和点号 '.'。不能以短横  '-'  开头，不能以 ".git" 或 ".atom" 结尾。 */,
                    pattern:
                      '^(?!-)(?!.*\\.git$)(?!.*\\.atom$)[A-Za-z0-9_-]+(?:\\.[A-Za-z0-9_-]+)*$',
                    children: '未知',
                    required: true,
                    whitespace: true,
                  },
                ],
              }}
              componentProps={{ 'x-component-props': { placeholder: '请输入' } }}
              __component_name="FormilyInput"
            />
            <FormilyInput
              fieldProps={{
                name: 'description',
                title: this.i18n('i18n-pf9ss9vm') /* 描述 */,
                'x-validator': [],
              }}
              componentProps={{ 'x-component-props': { placeholder: '请输入' } }}
              __component_name="FormilyInput"
            />
          </FormilyForm>
        </Modal>
        <Modal
          ref={this._refsManager.linkRef('modal-8e5b5b67')}
          mask={true}
          onOk={function () {
            return this.confirmUpdateApp.apply(
              this,
              Array.prototype.slice.call(arguments).concat([])
            );
          }.bind(this)}
          open={__$$eval(() => this.state.updateAppModalOpen)}
          title={this.i18n('i18n-l3bqhr6f') /* 属性设置 */}
          centered={false}
          keyboard={true}
          onCancel={function () {
            return this.closeUpdateAppModal.apply(
              this,
              Array.prototype.slice.call(arguments).concat([])
            );
          }.bind(this)}
          forceRender={false}
          maskClosable={false}
          confirmLoading={__$$eval(() => this.state.updateAppModalConfirmLoading)}
          destroyOnClose={true}
          __component_name="Modal"
        >
          <FormilyForm
            ref={this._refsManager.linkRef('update_app_form')}
            componentProps={{
              colon: false,
              layout: 'horizontal',
              labelCol: 4,
              labelAlign: 'left',
              wrapperCol: 20,
            }}
            __component_name="FormilyForm"
          >
            <FormilyInput
              fieldProps={{
                name: 'id',
                title: this.i18n('i18n-v88cpaiy') /* 应用 ID */,
                'x-pattern': 'disabled',
                'x-validator': [],
              }}
              componentProps={{ 'x-component-props': { placeholder: '请输入' } }}
              __component_name="FormilyInput"
            />
            <FormilyInput
              fieldProps={{
                name: 'namespace',
                title: this.i18n('i18n-rai2jazr') /* 命名空间 */,
                'x-pattern': 'disabled',
                'x-validator': [],
              }}
              componentProps={{ 'x-component-props': { placeholder: '请输入' } }}
              __component_name="FormilyInput"
            />
            <FormilyInput
              fieldProps={{
                name: 'name',
                title: this.i18n('i18n-iiikgh5p') /* 应用名称 */,
                description: this.i18n('i18n-lh9r0aur') /* 名称不能跟其他应用重复 */,
                'x-validator': [],
              }}
              componentProps={{ 'x-component-props': { placeholder: '请输入' } }}
              __component_name="FormilyInput"
            />
            <FormilyInput
              fieldProps={{
                name: 'description',
                title: this.i18n('i18n-pf9ss9vm') /* 描述 */,
                'x-validator': [],
              }}
              componentProps={{ 'x-component-props': { placeholder: '请输入' } }}
              __component_name="FormilyInput"
            />
          </FormilyForm>
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
              {this.i18n('i18n-l30ktk9c') /* 应用管理 */}
            </Typography.Title>
          </Col>
          <Col span={24} __component_name="Col">
            <Card
              size="default"
              type="default"
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
                    return this.openCreateAppModal.apply(
                      this,
                      Array.prototype.slice.call(arguments).concat([])
                    );
                  }.bind(this)}
                  disabled={false}
                  __component_name="Button"
                >
                  {this.i18n('i18n-cdepvr38') /* 新增应用 */}
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
                  ref={this._refsManager.linkRef('input.search-f764ab83')}
                  placeholder="输入应用名称搜索"
                  __component_name="Input.Search"
                />
              </Space>
              <Table
                ref={this._refsManager.linkRef('table-f27f5c67')}
                size="default"
                style={{ marginTop: '-45px' }}
                rowKey="id"
                scroll={{ scrollToFirstRowOnChange: true }}
                columns={[
                  {
                    key: 'name',
                    title: this.i18n('i18n-iiikgh5p') /* 应用名称 */,
                    render: (text, record, index) =>
                      (__$$context => (
                        <UnifiedLink
                          to={__$$eval(() => '/apps/' + record.id)}
                          target="_self"
                          __component_name="UnifiedLink"
                        >
                          {__$$eval(() => record.name)}
                        </UnifiedLink>
                      ))(__$$createChildContext(__$$context, { text, record, index })),
                    dataIndex: 'name',
                  },
                  { key: 'id', title: this.i18n('i18n-v88cpaiy') /* 应用 ID */, dataIndex: 'id' },
                  { title: this.i18n('i18n-rai2jazr') /* 命名空间 */, dataIndex: 'namespace' },
                  {
                    key: '',
                    title: this.i18n('i18n-pf9ss9vm') /* 描述 */,
                    sorter: false,
                    dataIndex: 'description',
                  },
                  {
                    key: '',
                    title: this.i18n('i18n-yhtaj9mp') /* 创建时间 */,
                    render: /* 插槽容器*/ (text, record, index) =>
                      (__$$context => (
                        <Typography.Time
                          time={__$$eval(() => text)}
                          format=""
                          relativeTime={true}
                          __component_name="Typography.Time"
                        />
                      ))(__$$createChildContext(__$$context, { text, record, index })),
                    dataIndex: 'createAt',
                  },
                  {
                    title: this.i18n('i18n-d2brlroc') /* 更新时间 */,
                    render: (text, record, index) =>
                      (__$$context => (
                        <Typography.Time
                          time={__$$eval(() => text)}
                          format=""
                          relativeTime={true}
                          __component_name="Typography.Time"
                        />
                      ))(__$$createChildContext(__$$context, { text, record, index })),
                    sorter: true,
                    dataIndex: 'updateAt',
                  },
                  {
                    key: 'op',
                    title: this.i18n('i18n-uel9pjrj') /* 操作 */,
                    width: 180,
                    render: (text, record, index) =>
                      (__$$context => (
                        <Space
                          size={0}
                          align="center"
                          direction="horizontal"
                          __component_name="Space"
                        >
                          <Button
                            type="link"
                            block={false}
                            ghost={true}
                            shape="default"
                            danger={false}
                            onClick={function () {
                              return this.goPage.apply(
                                this,
                                Array.prototype.slice.call(arguments).concat([
                                  {
                                    record: record,
                                    page: 'branches',
                                  },
                                ])
                              );
                            }.bind(__$$context)}
                            disabled={false}
                            __component_name="Button"
                          >
                            {this.i18n('i18n-fmetyy4f') /* 分支管理 */}
                          </Button>
                          <Button
                            type="link"
                            block={false}
                            ghost={true}
                            shape="default"
                            danger={false}
                            onClick={function () {
                              return this.goPage.apply(
                                this,
                                Array.prototype.slice.call(arguments).concat([
                                  {
                                    record: record,
                                    page: 'members',
                                  },
                                ])
                              );
                            }.bind(__$$context)}
                            disabled={false}
                            __component_name="Button"
                          >
                            {this.i18n('i18n-4sb1nxis') /* 成员管理 */}
                          </Button>
                          <Dropdown
                            menu={{
                              items: [
                                { key: 'props', label: this.i18n('i18n-l3bqhr6f') /* 属性设置 */ },
                                { key: 'delete', label: this.i18n('i18n-it3zdrk8') /* 删除 */ },
                              ],
                              onClick: function () {
                                return this.menuOnClick.apply(
                                  this,
                                  Array.prototype.slice.call(arguments).concat([record])
                                );
                              }.bind(__$$context),
                            }}
                            trigger={['hover']}
                            disabled={false}
                            placement="bottomLeft"
                            __component_name="Dropdown"
                            destroyPopupOnHide={true}
                          >
                            <Button
                              type="link"
                              block={false}
                              ghost={false}
                              shape="default"
                              danger={false}
                              disabled={false}
                              __component_name="Button"
                            >
                              {[
                                <Typography.Text
                                  style={{ color: 'inherit', fontSize: '' }}
                                  strong={false}
                                  disabled={false}
                                  __component_name="Typography.Text"
                                  key="node_oclc4k4zfy1u"
                                >
                                  {this.i18n('i18n-7v35tkdj') /* 更多 */}
                                </Typography.Text>,
                                <AntdIconDownOutlined
                                  __component_name="AntdIconDownOutlined"
                                  key="node_ocllepwfwq1"
                                />,
                              ]}
                            </Button>
                          </Dropdown>
                        </Space>
                      ))(__$$createChildContext(__$$context, { text, record, index })),
                    dataIndex: 'op',
                  },
                ]}
                loading={__$$eval(() => this.props.useGetCurrentUserApps?.loading)}
                dataSource={__$$eval(
                  () => this.props.useGetCurrentUserApps?.data?.currentUser?.apps || []
                )}
                pagination={{
                  size: 'default',
                  simple: true,
                  position: ['topRight'],
                  showTotal: function () {
                    return this.paginationShowTotal.apply(
                      this,
                      Array.prototype.slice.call(arguments).concat([])
                    );
                  }.bind(this),
                  showQuickJumper: false,
                  showSizeChanger: false,
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
  const match = matchPath({ path: '/apps' }, location.pathname);
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
        enabled: undefined,
        func: 'undefined',
        params: undefined,
      }}
      sdkSwrFuncs={[
        {
          func: 'useGetCurrentUserApps',
          params: undefined,
          enableLocationSearch: undefined,
        },
      ]}
      render={dataProps => <Apps$$Page {...dataProps} self={self} appHelper={appHelper} />}
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
