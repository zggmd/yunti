// 注意: 出码引擎注入的临时变量默认都以 "__$$" 开头，禁止在搭建的代码中直接访问。
// 例外：react 框架的导出名和各种组件名除外。
import React from 'react';

import {
  Page,
  Card,
  Row,
  Col,
  Input,
  Button,
  Empty,
  Menu,
  Typography,
  Space,
  Select,
  Dropdown,
  Iframe,
  Modal,
  FormilyForm,
  FormilyInput,
  FormilyTextArea,
  FormilySelect,
  Alert,
} from '@tenx-ui/materials';

import { AntdIconPlusOutlined } from '@tenx-ui/icon-materials';

import { useLocation, matchPath } from '@umijs/max';
import DataProvider from '../../components/DataProvider';
import qs from 'query-string';
import { getUnifiedHistory } from '@tenx-ui/utils/es/UnifiedLink/index.prod';

import utils, { RefsManager } from '../../utils/__utils';

import * as __$$i18n from '../../i18n';

import __$$constants from '../../__constants';

import './index.css';

class AppDetailPages$$Page extends React.Component {
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
      createPageModalOpen: false,
      editPagePropsModalOpen: false,
      deletePageConfirmModalOpen: false,
    };

    this.bff = this.utils.getSdkById(this.match.params.appId);
  }

  $ = refName => {
    return this._refsManager.get(refName);
  };

  $$ = refName => {
    return this._refsManager.getAll(refName);
  };

  menuOnClick({ key }) {
    switch (key) {
      case 'props': {
        return this.openEditPagePropsModal(this.getCurrentPage());
      }
      case 'open-in-new-page-preview': {
        return window.open(this.getPreviewIframeSrc());
      }
      case 'delete': {
        return this.openDeletePageConfirmModal();
      }
      default:
        break;
    }
  }

  openPreview() {
    window.open(this.getPreviewIframeSrc());
  }

  onPageSelect({ key }) {
    this.setState({
      pageId: key,
    });
  }

  getCurrentPage() {
    const id = this.state.pageId;
    const pages = this.props.useGetApp?.data?.app?.pages || [];
    if (!id) {
      return pages[0];
    }
    return pages.find(p => p.id === id);
  }

  getPagesOptions() {
    const pages = this.props.useGetApp?.data?.app?.pages || [];
    const options = pages.map(({ id, title }) => ({
      label: title,
      value: id,
    }));
    // console.log('options', options)
    return options;
  }

  confirmCreatePage(e) {
    const form = this.$('create_page_form')?.formRef?.current?.form;
    form.submit(async values => {
      values.appId = this.match.params.appId;
      console.log('values', values);
      try {
        await this.bff.createPage({
          page: values,
        });
        this.closeCreatePageModal();
        this.utils.notification.success({
          message: '创建页面成功',
        });
        this.props.useGetApp.mutate();
      } catch (error) {
        this.utils.notification.warnings({
          message: '创建页面失败',
          errors: error?.response?.errors,
        });
      }
    });
  }

  async confirmDeletePage(e) {
    const page = this.getCurrentPage();
    await this.bff.deletePage({
      id: page.id,
    });
    this.closeDeletePageConfirmModal();
    this.setState({
      pageId: undefined,
    });
    this.utils.notification.success({
      message: `页面 ${page.title} 删除成功`,
    });
    this.props.useGetApp.mutate();
  }

  getBranchesOptions() {
    const options =
      this.props.useGetApp?.data?.app?.branches?.map(item => ({
        label: item.displayName,
        value: item.name,
      })) || [];
    return options;
  }

  getPreviewIframeSrc() {
    return `/preview/page?appId=${this.match.params.appId || ''}&pageId=${
      this.getCurrentPage()?.id || ''
    }`;
  }

  openCreatePageModal() {
    this.setState({
      createPageModalOpen: true,
    });
  }

  closeCreatePageModal() {
    this.setState({
      createPageModalOpen: false,
    });
  }

  confirmEditPageProps(e) {
    const form = this.$('edit_page_props_form')?.formRef?.current?.form;
    form.submit(async values => {
      try {
        await this.bff.updatePage({
          page: values,
        });
        this.closeEditPagePropsModal();
        this.utils.notification.success({
          message: '编辑页面属性成功',
        });
        this.props.useGetApp.mutate();
      } catch (error) {
        this.utils.notification.warnings({
          message: '编辑页面属性失败',
          errors: error?.response?.errors,
        });
      }
    });
  }

  handleBranchesChange(value) {
    this.utils.setTree(this.match?.params?.appId, value);
    // @Todo: workaround
    window.location.reload();
  }

  onDesignPageBtnClick() {
    window.open(`/design/apps/${this.match.params.appId}/pages/${this.getCurrentPage()?.id}`);
  }

  openEditPagePropsModal(record) {
    this.setState(
      {
        editPagePropsModalOpen: true,
      },
      async () => {
        await this.utils.sleep(1);
        const form = this.$('edit_page_props_form')?.formRef?.current?.form;
        form.reset();
        form.setValues({
          id: record.id,
          title: record.title,
          pathname: record.pathname,
        });
        const pageData = await this.bff.getPage({
          id: record.id,
        });
        const fileName = pageData?.page?.content?.componentsTree?.[0]?.fileName;
        form.setValues({
          fileName,
        });
      }
    );
  }

  closeEditPagePropsModal() {
    this.setState({
      editPagePropsModalOpen: false,
    });
  }

  openDeletePageConfirmModal() {
    this.setState({
      deletePageConfirmModalOpen: true,
    });
  }

  closeDeletePageConfirmModal() {
    this.setState({
      deletePageConfirmModalOpen: false,
    });
  }

  componentDidMount() {}

  render() {
    const __$$context = this._context || this;
    const { state } = __$$context;
    return (
      <Page style={{ padding: '0' }} pagePadding={0} pagePaddingTop={0} pagePaddingBottom={0}>
        <Card
          ref={this._refsManager.linkRef('card-e6c7c8c3')}
          size="default"
          type="default"
          style={{}}
          actions={[]}
          loading={false}
          bordered={false}
          hoverable={false}
          __component_name="Card"
        >
          <Row wrap={false} __component_name="Row">
            <Col
              ref={this._refsManager.linkRef('col-f6e9b8a5')}
              flex="270px"
              style={{ height: 'calc(100% - 800px)' }}
              __component_name="Col"
            >
              <Row
                wrap={false}
                align="stretch"
                style={{ marginBottom: '16px' }}
                justify="space-between"
                __component_name="Row"
              >
                <Col flex="auto" __component_name="Col">
                  <Input.Search
                    onChange={function () {
                      this.handleSearchValueChange.apply(
                        this,
                        Array.prototype.slice.call(arguments).concat([])
                      );
                    }.bind(this)}
                    placeholder={this.i18n('i18n-xgcwv3vl') /* 请输入页面标题 */}
                    __component_name="Input.Search"
                  />
                </Col>
                <Col flex="42px" style={{ padding: '0' }} __component_name="Col">
                  <Button
                    icon={<AntdIconPlusOutlined __component_name="AntdIconPlusOutlined" />}
                    type="primary"
                    block={false}
                    ghost={false}
                    shape="default"
                    danger={false}
                    onClick={function () {
                      return this.openCreatePageModal.apply(
                        this,
                        Array.prototype.slice.call(arguments).concat([])
                      );
                    }.bind(this)}
                    disabled={false}
                    __component_name="Button"
                  />
                </Col>
              </Row>
              {!!__$$eval(
                () =>
                  !this.props.useGetApp?.loading &&
                  this.props.useGetApp?.data?.app?.pages?.length === 0
              ) && (
                <Empty
                  ref={this._refsManager.linkRef('empty-14c0d980')}
                  description={this.i18n('i18n-o0ei2yue') /* 还没有页面，点击添加按钮创建 */}
                  __component_name="Empty"
                />
              )}
              <Menu
                ref={this._refsManager.linkRef('menu-01e07c6a')}
                mode="inline"
                items={__$$eval(() =>
                  (this.props.useGetApp?.data?.app?.pages || []).map(p => ({
                    key: p.id,
                    label: p.title,
                  }))
                )}
                style={{ height: 'calc(100vh - 160px)', overflow: 'auto' }}
                theme="light"
                multiple={false}
                onSelect={function () {
                  return this.onPageSelect.apply(
                    this,
                    Array.prototype.slice.call(arguments).concat([])
                  );
                }.bind(this)}
                openKeys={[]}
                selectable={true}
                inlineIndent={8}
                selectedKeys={__$$eval(() => this.getCurrentPage()?.id)}
                defaultOpenKeys={[]}
                inlineCollapsed={false}
                subMenuOpenDelay={0}
                subMenuCloseDelay={0}
                forceSubMenuRender={false}
                defaultSelectedKeys={[]}
                overflowedIndicator=""
                triggerSubMenuAction="hover"
              />
            </Col>
            <Col flex="auto" style={{ height: '100%' }} __component_name="Col">
              <Row
                wrap={false}
                style={{ marginBottom: '16px' }}
                justify="space-between"
                __component_name="Row"
              >
                <Col __component_name="Col">
                  <Typography.Title
                    bold={true}
                    level={1}
                    bordered={false}
                    ellipsis={true}
                    __component_name="Typography.Title"
                  >
                    {__$$eval(() => this.getCurrentPage()?.title)}
                  </Typography.Title>
                </Col>
                <Col __component_name="Col">
                  <Space align="center" direction="horizontal" __component_name="Space">
                    <Select
                      style={{ width: '150' }}
                      value={__$$eval(() => this.utils.getTreeById(this.match?.params?.appId))}
                      options={__$$eval(() => this.getBranchesOptions())}
                      disabled={false}
                      onChange={function () {
                        return this.handleBranchesChange.apply(
                          this,
                          Array.prototype.slice.call(arguments).concat([])
                        );
                      }.bind(this)}
                      allowClear={false}
                      showSearch={true}
                      placeholder={this.i18n('i18n-lc0lwakk') /* 请选择分支或版本 */}
                      _sdkSwrGetFunc={{}}
                      notFoundContent=""
                      __component_name="Select"
                    />
                    <Button
                      block={false}
                      ghost={false}
                      shape="default"
                      danger={false}
                      onClick={function () {
                        return this.openPreview.apply(
                          this,
                          Array.prototype.slice.call(arguments).concat([])
                        );
                      }.bind(this)}
                      disabled={false}
                      __component_name="Button"
                    >
                      {this.i18n('i18n-scef9t49') /* 新窗口预览 */}
                    </Button>
                    <Dropdown.Button
                      ref={this._refsManager.linkRef('dropdown.button-eb1a5b1d')}
                      menu={{
                        items: [
                          { key: 'props', label: this.i18n('i18n-l3bqhr6f') /* 属性设置 */ },
                          { key: 'delete', label: this.i18n('i18n-it3zdrk8') /* 删除 */ },
                        ],
                        onClick: function () {
                          return this.menuOnClick.apply(
                            this,
                            Array.prototype.slice.call(arguments).concat([])
                          );
                        }.bind(this),
                      }}
                      type="primary"
                      danger={false}
                      onClick={function () {
                        return this.onDesignPageBtnClick.apply(
                          this,
                          Array.prototype.slice.call(arguments).concat([])
                        );
                      }.bind(this)}
                      trigger={['hover']}
                      disabled={__$$eval(() => !this.getCurrentPage()?.id)}
                      placement="bottomRight"
                      __component_name="Dropdown.Button"
                      destroyPopupOnHide={true}
                    >
                      {this.i18n('i18n-io50zahr') /* 设计页面 */}
                    </Dropdown.Button>
                  </Space>
                </Col>
              </Row>
              <Row wrap={true} __component_name="Row">
                <Col
                  span={24}
                  style={{ width: '100%', height: 'calc(100vh - 160px)' }}
                  __component_name="Col"
                >
                  <Iframe
                    src={__$$eval(() => this.getPreviewIframeSrc())}
                    name="iframe1"
                    style={{
                      top: '0',
                      left: '0',
                      right: '0',
                      width: '100%',
                      border: '1px solid',
                      bottom: '0',
                      height: '100%',
                      zIndex: '1',
                      outline: 'none',
                      overflow: 'auto',
                      position: 'relative',
                      borderRadius: '2px',
                    }}
                    __showRealSrc={false}
                    __component_name="Iframe"
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>
        <Modal
          mask={true}
          onOk={function () {
            return this.confirmEditPageProps.apply(
              this,
              Array.prototype.slice.call(arguments).concat([])
            );
          }.bind(this)}
          open={__$$eval(() => this.state.editPagePropsModalOpen)}
          title={this.i18n('i18n-l3bqhr6f') /* 属性设置 */}
          centered={false}
          keyboard={true}
          onCancel={function () {
            return this.closeEditPagePropsModal.apply(
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
            ref={this._refsManager.linkRef('edit_page_props_form')}
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
                name: 'title',
                title: this.i18n('i18n-3e6ypkso') /* 页面标题 */,
                'x-validator': [
                  {
                    id: 'disabled',
                    icon: 'tenx-ui-icon:Circle',
                    type: 'disabled',
                    message: this.i18n('i18n-xgcwv3vl') /* 请输入页面标题 */,
                    children: '未知',
                    required: true,
                    whitespace: true,
                  },
                ],
              }}
              componentProps={{
                'x-component-props': {
                  placeholder: this.i18n('i18n-xgcwv3vl') /* 请输入页面标题 */,
                },
              }}
              decoratorProps={{ 'x-decorator-props': { asterisk: true } }}
              __component_name="FormilyInput"
            />
            <FormilyInput
              fieldProps={{
                name: 'pathname',
                title: this.i18n('i18n-21sko24b') /* 页面路由 */,
                'x-validator': [
                  {
                    id: 'disabled',
                    icon: 'tenx-ui-icon:Circle',
                    type: 'disabled',
                    message: this.i18n('i18n-umtxjgit') /* 请输入页面访问路径 */,
                    children: '未知',
                    required: true,
                    whitespace: true,
                  },
                ],
              }}
              componentProps={{
                'x-component-props': {
                  placeholder: this.i18n('i18n-umtxjgit') /* 请输入页面访问路径 */,
                },
              }}
              decoratorProps={{ 'x-decorator-props': { colon: false, asterisk: true } }}
              __component_name="FormilyInput"
            />
            <FormilyTextArea
              fieldProps={{
                name: 'fileName',
                title: this.i18n('i18n-8aq0hr2j') /* 文件名 */,
                description: '用于出码时页面文件的命名',
                'x-component': 'Input.TextArea',
                'x-validator': [
                  {
                    id: 'disabled',
                    icon: 'tenx-ui-icon:Circle',
                    type: 'disabled',
                    message: this.i18n('i18n-6t2leoby') /* 请输入页面文件名 */,
                    children: '未知',
                    required: true,
                    whitespace: true,
                  },
                ],
                _unsafe_MixedSetter_description_select: 'StringSetter',
              }}
              componentProps={{
                'x-component-props': {
                  placeholder: this.i18n('i18n-6t2leoby') /* 请输入页面文件名 */,
                },
              }}
              decoratorProps={{ 'x-decorator-props': { colon: false, asterisk: true } }}
              __component_name="FormilyTextArea"
            />
          </FormilyForm>
        </Modal>
        <Modal
          mask={true}
          onOk={function () {
            return this.confirmCreatePage.apply(
              this,
              Array.prototype.slice.call(arguments).concat([])
            );
          }.bind(this)}
          open={__$$eval(() => this.state.createPageModalOpen)}
          title={this.i18n('i18n-8hwlwfxt') /* 新增页面 */}
          centered={false}
          keyboard={true}
          onCancel={function () {
            return this.closeCreatePageModal.apply(
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
            ref={this._refsManager.linkRef('create_page_form')}
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
                enum: __$$eval(() => this.getPagesOptions()),
                name: 'contentFrom.pageId',
                title: this.i18n('i18n-a7dfj5mr') /* 模板 */,
                'x-validator': [],
                _unsafe_MixedSetter_enum_select: 'ExpressionSetter',
              }}
              componentProps={{
                'x-component-props': {
                  enum: null,
                  disabled: false,
                  allowClear: false,
                  placeholder: '请选择',
                  _unsafe_MixedSetter_enum_select: 'ExpressionSetter',
                },
              }}
              decoratorProps={{
                'x-decorator-props': {
                  tooltip: '目前只支持选择应用内的页面作为模板',
                  _unsafe_MixedSetter_tooltip_select: 'StringSetter',
                },
              }}
              __component_name="FormilySelect"
            />
            <FormilyInput
              fieldProps={{
                name: 'title',
                title: this.i18n('i18n-3e6ypkso') /* 页面标题 */,
                'x-validator': [
                  {
                    id: 'disabled',
                    icon: 'tenx-ui-icon:Circle',
                    type: 'disabled',
                    message: this.i18n('i18n-xgcwv3vl') /* 请输入页面标题 */,
                    children: '未知',
                    required: true,
                    whitespace: true,
                  },
                ],
              }}
              componentProps={{
                'x-component-props': {
                  placeholder: this.i18n('i18n-xgcwv3vl') /* 请输入页面标题 */,
                },
              }}
              decoratorProps={{ 'x-decorator-props': { asterisk: true } }}
              __component_name="FormilyInput"
            />
            <FormilyInput
              fieldProps={{
                name: 'pathname',
                title: this.i18n('i18n-21sko24b') /* 页面路由 */,
                'x-validator': [
                  {
                    id: 'disabled',
                    icon: 'tenx-ui-icon:Circle',
                    type: 'disabled',
                    message: this.i18n('i18n-umtxjgit') /* 请输入页面访问路径 */,
                    children: '未知',
                    required: true,
                    whitespace: true,
                  },
                ],
              }}
              componentProps={{
                'x-component-props': {
                  placeholder: this.i18n('i18n-umtxjgit') /* 请输入页面访问路径 */,
                },
              }}
              decoratorProps={{ 'x-decorator-props': { colon: false, asterisk: true } }}
              __component_name="FormilyInput"
            />
            <FormilyInput
              fieldProps={{
                name: 'fileName',
                title: this.i18n('i18n-8aq0hr2j') /* 文件名 */,
                description:
                  this.i18n(
                    'i18n-godkp0bg'
                  ) /* 用于出码时页面文件的命名，要符合 React 组件大驼峰命名要求 */,
                'x-validator': [],
              }}
              componentProps={{ 'x-component-props': { placeholder: '请输入' } }}
              decoratorProps={{ 'x-decorator-props': { asterisk: true } }}
              __component_name="FormilyInput"
            />
          </FormilyForm>
        </Modal>
        <Modal
          mask={true}
          onOk={function () {
            return this.confirmDeletePage.apply(
              this,
              Array.prototype.slice.call(arguments).concat([])
            );
          }.bind(this)}
          open={__$$eval(() => this.state.deletePageConfirmModalOpen)}
          title="确认删除页面"
          centered={false}
          keyboard={true}
          onCancel={function () {
            return this.closeDeletePageConfirmModal.apply(
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
            message={__$$eval(() => `确定删除页面 ${this.getCurrentPage()?.title} 吗？`)}
            showIcon={true}
            __component_name="Alert"
          />
        </Modal>
      </Page>
    );
  }
}

const PageWrapper = () => {
  const location = useLocation();
  const history = getUnifiedHistory();
  const match = matchPath({ path: '/apps/:appId/pages' }, location.pathname);
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
        enabled: true,
        func: 'getSdkById',
        params: function applyThis() {
          return this.match?.params?.appId;
        }.apply(self),
      }}
      sdkSwrFuncs={[
        {
          func: 'useGetApp',
          params: function applyThis() {
            return {
              id: this.match?.params?.appId,
              tree: this.utils.getTreeById(this.match?.params?.appId),
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
        <AppDetailPages$$Page {...dataProps} self={self} appHelper={appHelper} />
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
