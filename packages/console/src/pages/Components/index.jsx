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
  Button,
  Space,
  Input,
  Card,
  Table,
  UnifiedLink,
  Dropdown,
} from '@tenx-ui/materials';

import { AntdIconPlusOutlined, AntdIconDownOutlined } from '@tenx-ui/icon-materials';

import { useLocation, matchPath } from '@umijs/max';
import DataProvider from '../../components/DataProvider';
import qs from 'query-string';
import { getUnifiedHistory } from '@tenx-ui/utils/es/UnifiedLink/index.prod';

import utils, { RefsManager } from '../../utils/__utils';

import * as __$$i18n from '../../i18n';

import __$$constants from '../../__constants';

import './index.css';

class Components$$Page extends React.Component {
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
      createModalOpen: false,
      updateModalOpen: false,
      createModalConfirmLoading: false,
      updateModalConfirmLoading: false,
    };
  }

  $ = refName => {
    return this._refsManager.get(refName);
  };

  $$ = refName => {
    return this._refsManager.getAll(refName);
  };

  menuOnClick(e, record) {
    switch (e.key) {
      case 'versions':
      case 'members': {
        return this.history.push(`${this.location.pathname}/${record.id}/${e.key}`);
      }
      default: {
        break;
      }
    }
  }

  confirmCreate(e) {
    const form = this.$('create_form')?.formRef?.current?.form;
    form.submit(async values => {
      console.log('values', values);
      this.setState({
        createModalConfirmLoading: true,
      });
      try {
        await this.utils.bff.createComponent({
          component: values,
        });
        this.closeCreateModal();
        this.utils.notification.success({
          message: '创建成功',
        });
        this.props.useGetCurrentUserComponents.mutate();
      } catch (error) {
        this.utils.notification.warnings({
          message: '创建失败',
          errors: error?.response?.errors,
        });
      } finally {
        this.setState({
          createModalConfirmLoading: false,
        });
      }
    });
  }

  confirmUpdate(e) {
    const form = this.$('update_form')?.formRef?.current?.form;
    form.submit(async values => {
      delete values.namespace;
      this.setState({
        updateModalConfirmLoading: true,
      });
      try {
        await this.utils.bff.updateComponent({
          component: values,
        });
        this.closeCreateModal();
        this.utils.notification.success({
          message: '属性更新成功',
        });
        this.props.useGetCurrentUserComponents.mutate();
      } catch (error) {
        this.utils.notification.warnings({
          message: '属性更新失败',
          errors: error?.response?.errors,
        });
      } finally {
        this.closeUpdateModal();
        this.setState({
          updateModalConfirmLoading: false,
        });
      }
    });
  }

  openCreateModal(e) {
    this.setState({
      createModalOpen: true,
    });
  }

  openUpdateModal(e, record) {
    this.setState(
      {
        updateModalOpen: true,
      },
      async () => {
        await this.utils.sleep(1);
        const form = this.$('update_form')?.formRef?.current?.form;
        form.reset();
        form.setValues({
          id: record.id,
          namespace: record.namespace,
          name: record.name,
          description: record.description,
        });
        const componentData = await this.utils.bff.getComponent({
          id: record.id,
        });
        const fileName = componentData?.component?.schema?.componentsTree?.[0]?.fileName;
        form.setValues({
          fileName,
        });
      }
    );
  }

  closeCreateModal() {
    this.setState({
      createModalOpen: false,
    });
  }

  closeUpdateModal() {
    this.setState({
      updateModalOpen: false,
    });
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
            return this.confirmCreate.apply(this, Array.prototype.slice.call(arguments).concat([]));
          }.bind(this)}
          open={__$$eval(() => this.state.createModalOpen)}
          title={this.i18n('i18n-l8bqf47j') /* 新增组件 */}
          __events={{
            eventList: [
              {
                name: 'afterClose',
                disabled: false,
                templete:
                  "onCancel(${extParams}){\n// 完全关闭后的回调\nconsole.log('afterClose');}",
              },
              {
                name: 'onCancel',
                disabled: true,
                template:
                  "onCancel(${extParams}){\n// 点击遮罩层或右上角叉或取消按钮的回调\nconsole.log('onCancel');}",
              },
              {
                name: 'onOk',
                disabled: true,
                template: "onOk(${extParams}){\n// 点击确定回调\nconsole.log('onOk');}",
              },
            ],
            eventDataList: [
              { name: 'onCancel', type: 'componentEvent', relatedEventName: 'closeCreateModal' },
              { name: 'onOk', type: 'componentEvent', relatedEventName: 'confirmCreate' },
            ],
          }}
          centered={false}
          keyboard={true}
          onCancel={function () {
            return this.closeCreateModal.apply(
              this,
              Array.prototype.slice.call(arguments).concat([])
            );
          }.bind(this)}
          forceRender={false}
          maskClosable={false}
          confirmLoading={__$$eval(() => this.state.createModalConfirmLoading)}
          destroyOnClose={true}
          __component_name="Modal"
        >
          <FormilyForm
            ref={this._refsManager.linkRef('create_form')}
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
                title: this.i18n('i18n-7m8cg2t3') /* 组件名称 */,
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
                description: this.i18n('i18n-3fii1xqj') /* 组件的唯一标识，创建后不能修改 */,
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
                name: 'fileName',
                title: this.i18n('i18n-8aq0hr2j') /* 文件名 */,
                required: true,
                description:
                  this.i18n(
                    'i18n-godkp0bg'
                  ) /* 用于出码时页面文件的命名，要符合 React 组件大驼峰命名要求 */,
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
            return this.confirmUpdate.apply(this, Array.prototype.slice.call(arguments).concat([]));
          }.bind(this)}
          open={__$$eval(() => this.state.updateModalOpen)}
          title={this.i18n('i18n-l3bqhr6f') /* 属性设置 */}
          __events={{
            eventList: [
              {
                name: 'afterClose',
                disabled: false,
                templete:
                  "onCancel(${extParams}){\n// 完全关闭后的回调\nconsole.log('afterClose');}",
              },
              {
                name: 'onCancel',
                disabled: true,
                template:
                  "onCancel(${extParams}){\n// 点击遮罩层或右上角叉或取消按钮的回调\nconsole.log('onCancel');}",
              },
              {
                name: 'onOk',
                disabled: true,
                template: "onOk(${extParams}){\n// 点击确定回调\nconsole.log('onOk');}",
              },
            ],
            eventDataList: [
              { name: 'onCancel', type: 'componentEvent', relatedEventName: 'closeUpdateModal' },
              { name: 'onOk', type: 'componentEvent', relatedEventName: 'confirmUpdate' },
            ],
          }}
          centered={false}
          keyboard={true}
          onCancel={function () {
            return this.closeUpdateModal.apply(
              this,
              Array.prototype.slice.call(arguments).concat([])
            );
          }.bind(this)}
          forceRender={false}
          maskClosable={false}
          confirmLoading={__$$eval(() => this.state.updateModalConfirmLoading)}
          destroyOnClose={true}
          __component_name="Modal"
        >
          <FormilyForm
            ref={this._refsManager.linkRef('update_form')}
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
                title: this.i18n('i18n-oqzjt4q8') /* 组件 ID */,
                required: true,
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
                required: true,
                'x-pattern': 'disabled',
                description: '',
                'x-validator': [],
              }}
              componentProps={{ 'x-component-props': { placeholder: '请输入' } }}
              __component_name="FormilyInput"
            />
            <FormilyInput
              fieldProps={{
                name: 'name',
                title: this.i18n('i18n-7m8cg2t3') /* 组件名称 */,
                required: true,
                description: this.i18n('i18n-lh9r0aur') /* 名称不能跟其他应用重复 */,
                'x-validator': [],
              }}
              componentProps={{ 'x-component-props': { placeholder: '请输入' } }}
              __component_name="FormilyInput"
            />
            <FormilyInput
              fieldProps={{
                name: 'fileName',
                title: this.i18n('i18n-8aq0hr2j') /* 文件名 */,
                required: true,
                description:
                  this.i18n(
                    'i18n-godkp0bg'
                  ) /* 用于出码时页面文件的命名，要符合 React 组件大驼峰命名要求 */,
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
        <Row wrap={true} __component_name="Row">
          <Col span={24} __component_name="Col">
            <Typography.Title
              bold={true}
              level={1}
              bordered={false}
              ellipsis={true}
              __component_name="Typography.Title"
            >
              {this.i18n('i18n-qqphansg') /* 组件管理 */}
            </Typography.Title>
          </Col>
          <Col span={24} __component_name="Col">
            <Row wrap={false} justify="space-between" __component_name="Row">
              <Col __component_name="Col">
                <Button
                  icon={<AntdIconPlusOutlined __component_name="AntdIconPlusOutlined" />}
                  type="primary"
                  block={false}
                  ghost={false}
                  shape="default"
                  danger={false}
                  onClick={function () {
                    return this.openCreateModal.apply(
                      this,
                      Array.prototype.slice.call(arguments).concat([])
                    );
                  }.bind(this)}
                  __events={{
                    eventList: [
                      {
                        name: 'onClick',
                        disabled: true,
                        template:
                          "onClick(event,${extParams}){\n// 点击按钮时的回调\nconsole.log('onClick', event);}",
                      },
                    ],
                    eventDataList: [
                      {
                        name: 'onClick',
                        type: 'componentEvent',
                        relatedEventName: 'openCreateModal',
                      },
                    ],
                  }}
                  disabled={false}
                  __component_name="Button"
                >
                  {this.i18n('i18n-l8bqf47j') /* 新增组件 */}
                </Button>
              </Col>
              <Col __component_name="Col">
                <Space size="large" align="center" direction="horizontal" __component_name="Space">
                  <Space align="center" direction="horizontal" __component_name="Space" />
                  <Input.Search
                    ref={this._refsManager.linkRef('input.search-f764ab83')}
                    __events={{
                      eventList: [
                        {
                          name: 'onChange',
                          disabled: true,
                          template:
                            "onChange(event,${extParams}){\n// 输入框内容变化时的回调\nconsole.log('onChange',event);}",
                        },
                        {
                          name: 'onPressEnter',
                          disabled: false,
                          template:
                            "onPressEnter(event,${extParams}){\n// 按下回车的回调\nconsole.log('onPressEnter',event);}",
                        },
                        {
                          name: 'onSearch',
                          disabled: false,
                          template:
                            "onSearch(value,event,${extParams}){\n// 点击搜索图标、清除图标，或按下回车键时的回调\nconsole.log('onSearch',value,event);}",
                        },
                        {
                          name: 'onFocus',
                          disabled: false,
                          template:
                            "onFocus(event,${extParams}){\n// 获取焦点回调\nconsole.log('onFocus',event);}",
                        },
                        {
                          name: 'onKeyDown',
                          disabled: false,
                          template:
                            "onKeyDown(event,${extParams}){\n// 按键按下时的回调\nconsole.log('onKeyDown',event);}",
                        },
                        {
                          name: 'onKeyPress',
                          disabled: false,
                          template:
                            "onKeyPress(event,${extParams}){\n// 按键按下后的回调\nconsole.log('onKeyPress',event);}",
                        },
                        {
                          name: 'onKeyUp',
                          disabled: false,
                          template:
                            "onKeyUp(event,${extParams}){\n// 按键释放回调\nconsole.log('onKeyUp',event);}",
                        },
                        {
                          name: 'onBlur',
                          disabled: false,
                          template:
                            "onBlur(event,${extParams}){\n// 按键释放回调\nconsole.log('onBlur',event);}",
                        },
                      ],
                      eventDataList: [],
                    }}
                    placeholder="输入组件名称搜索"
                    __component_name="Input.Search"
                  />
                </Space>
              </Col>
            </Row>
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
              <Table
                ref={this._refsManager.linkRef('table-f27f5c67')}
                size="default"
                rowKey="id"
                scroll={{ scrollToFirstRowOnChange: true }}
                columns={[
                  {
                    key: 'name',
                    title: this.i18n('i18n-7m8cg2t3') /* 组件名称 */,
                    render: (text, record, index) =>
                      (__$$context => (
                        <UnifiedLink
                          to={__$$eval(() => '/components/' + record.id)}
                          target="_self"
                          __component_name="UnifiedLink"
                        >
                          {__$$eval(() => record.name)}
                        </UnifiedLink>
                      ))(__$$createChildContext(__$$context, { text, record, index })),
                    dataIndex: 'name',
                  },
                  { title: this.i18n('i18n-oqzjt4q8') /* 组件 ID */, dataIndex: 'id' },
                  {
                    key: 'id',
                    title: this.i18n('i18n-rai2jazr') /* 命名空间 */,
                    dataIndex: 'namespace',
                  },
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
                              return this.openUpdateModal.apply(
                                this,
                                Array.prototype.slice.call(arguments).concat([record])
                              );
                            }.bind(__$$context)}
                            __events={{
                              eventList: [
                                {
                                  name: 'onClick',
                                  disabled: true,
                                  template:
                                    "onClick(event,${extParams}){\n// 点击按钮时的回调\nconsole.log('onClick', event);}",
                                },
                              ],
                              eventDataList: [
                                {
                                  name: 'onClick',
                                  type: 'componentEvent',
                                  paramStr: 'this.record',
                                  relatedEventName: 'openUpdateModal',
                                },
                              ],
                            }}
                            disabled={false}
                            __component_name="Button"
                          >
                            {this.i18n('i18n-l3bqhr6f') /* 属性设置 */}
                          </Button>
                          <Dropdown
                            menu={{
                              items: [
                                {
                                  key: 'versions',
                                  label: this.i18n('i18n-nk3u5cap') /* 版本管理 */,
                                },
                                {
                                  key: 'members',
                                  label: this.i18n('i18n-4sb1nxis') /* 成员管理 */,
                                },
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
                            __events={{
                              eventList: [
                                {
                                  name: 'menu.onClick',
                                  disabled: true,
                                  template:
                                    "onDropDownClick({ item, key, keyPath, domEvent }, ${extParams}){\n// onClick\t点击 MenuItem 调用此函数 \nconsole.log('onDropDownClick', item, key, keyPath, domEvent);}",
                                },
                              ],
                              eventDataList: [
                                {
                                  name: 'menu.onClick',
                                  type: 'componentEvent',
                                  paramStr: 'this.record',
                                  relatedEventName: 'menuOnClick',
                                },
                              ],
                            }}
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
                                >
                                  {this.i18n('i18n-7v35tkdj') /* 更多 */}
                                </Typography.Text>,
                                <AntdIconDownOutlined __component_name="AntdIconDownOutlined" />,
                              ]}
                            </Button>
                          </Dropdown>
                        </Space>
                      ))(__$$createChildContext(__$$context, { text, record, index })),
                    dataIndex: 'op',
                  },
                ]}
                loading={__$$eval(() => this.props.useGetApps?.data?.loading)}
                dataSource={__$$eval(
                  () => this.props.useGetCurrentUserComponents?.data?.currentUser?.components || []
                )}
                pagination={{
                  size: 'default',
                  total: __$$eval(
                    () => this.props.useGetCurrentUser?.data?.currentUser?.apps?.length || 0
                  ),
                  simple: false,
                  pageSize: 10,
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
  const match = matchPath({ path: '/components' }, location.pathname);
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
          func: 'useGetCurrentUserComponents',
          params: undefined,
        },
      ]}
      render={dataProps => <Components$$Page {...dataProps} self={self} appHelper={appHelper} />}
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
