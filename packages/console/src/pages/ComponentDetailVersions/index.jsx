// 注意: 出码引擎注入的临时变量默认都以 "__$$" 开头，禁止在搭建的代码中直接访问。
// 例外：react 框架的导出名和各种组件名除外。
import React from 'react';

import {
  Page,
  Card,
  Row,
  Col,
  Input,
  Menu,
  Space,
  Typography,
  Tag,
  Dropdown,
  Iframe,
  Modal,
  Alert,
} from '@tenx-ui/materials';

import { useLocation, matchPath } from '@umijs/max';
import DataProvider from '../../components/DataProvider';
import qs from 'query-string';
import { getUnifiedHistory } from '@tenx-ui/utils/es/UnifiedLink/index.prod';

import utils, { RefsManager } from '../../utils/__utils';

import * as __$$i18n from '../../i18n';

import __$$constants from '../../__constants';

import './index.css';

class ComponentDetailVersions$$Page extends React.Component {
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

    this.state = { commitId: undefined, deleteVersionConfirmModalOpen: false };
  }

  $ = refName => {
    return this._refsManager.get(refName);
  };

  $$ = refName => {
    return this._refsManager.getAll(refName);
  };

  getVersions() {
    const versions = this.props.useGetComponent?.data?.component?.versions || [];
    return [
      {
        commitId: this.utils.getTreeById(this.match.params.id),
        version: '开发中',
      },
      ...versions,
    ];
  }

  menuOnClick({ key }) {
    switch (key) {
      case 'open-in-new-page-preview': {
        return window.open(this.getPreviewIframeSrc());
      }
      case 'delete': {
        return this.openDeleteVersionConfirmModal();
      }
      default:
        break;
    }
  }

  onPageSelect({ key }) {
    this.setState({
      commitId: key,
    });
  }

  getCurrentVersion() {
    const commitId = this.state.commitId;
    const versions = this.getVersions();
    if (!commitId) {
      return versions[0];
    }
    return versions.find(p => p.commitId === commitId);
  }

  getPreviewIframeSrc() {
    return `/preview/component?componentId=${this.match.params.id || ''}&tree=${
      this.state.commitId || ''
    }`;
  }

  async confirmDeleteVersion(e) {
    const version = this.getCurrentVersion();
    await this.utils.bff.deleteComponentVersion({
      version: version.version,
    });
    this.closeDeleteVersionConfirmModal();
    this.setState({
      commitId: undefined,
    });
    this.utils.notification.success({
      message: `版本 ${page.title} 删除成功`,
    });
    this.props.useGetComponent.mutate();
  }

  onDesignPageBtnClick() {
    window.open(`/design/components/${this.match.params.id}`);
  }

  openDeleteVersionConfirmModal() {
    this.setState({
      deleteVersionConfirmModalOpen: true,
    });
  }

  closeDeleteVersionConfirmModal() {
    this.setState({
      deleteVersionConfirmModalOpen: false,
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
                      eventDataList: [
                        {
                          name: 'onChange',
                          type: 'componentEvent',
                          relatedEventName: 'handleSearchValueChange',
                        },
                      ],
                    }}
                    onChange={function () {
                      this.handleSearchValueChange.apply(
                        this,
                        Array.prototype.slice.call(arguments).concat([])
                      );
                    }.bind(this)}
                    placeholder={this.i18n('i18n-w80normr') /* 请输入版本号 */}
                    __component_name="Input.Search"
                  />
                </Col>
              </Row>
              <Menu
                ref={this._refsManager.linkRef('menu-01e07c6a')}
                mode="inline"
                items={__$$eval(() =>
                  this.getVersions().map(v => ({
                    key: v.commitId,
                    label: v.version,
                  }))
                )}
                style={{ height: 'calc(100vh - 160px)', overflow: 'auto' }}
                theme="light"
                __events={{
                  eventList: [
                    {
                      name: 'onClick',
                      disabled: false,
                      template:
                        "onClick({item,key,keyPath,domEvent},${extParams}){\n// 点击 MenuItem 调用此函数\nconsole.log('onClick',item,key,keyPath,domEvent);}",
                    },
                    {
                      name: 'onDeselect',
                      disabled: false,
                      template:
                        "onDeselect({item,key,keyPath,selectedKeys,domEvent},${extParams}){\n// 取消选中时调用，仅在 multiple 生效\nconsole.log('onDeselect',item,key,keyPath,selectedKeys,domEvent);}",
                    },
                    {
                      name: 'onOpenChange',
                      disabled: false,
                      template:
                        "onOpenChange(openKeys,${extParams}){\n// SubMenu 展开/关闭的回调\nconsole.log('onOpenChange',openKeys);}",
                    },
                    {
                      name: 'onSelect',
                      disabled: true,
                      template:
                        "onSelect({item,key,keyPath,selectedKeys,domEvent},${extParams}){\n// 被选中时调用\nconsole.log('onSelect',item,key,keyPath,selectedKeys,domEvent);}",
                    },
                  ],
                  eventDataList: [
                    { name: 'onSelect', type: 'componentEvent', relatedEventName: 'onPageSelect' },
                  ],
                }}
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
                selectedKeys={__$$eval(() => this.getCurrentVersion()?.commitId)}
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
                  <Space align="center" direction="horizontal">
                    <Typography.Title
                      bold={true}
                      level={1}
                      bordered={false}
                      ellipsis={true}
                      __component_name="Typography.Title"
                    >
                      版本预览
                    </Typography.Title>
                    <Tag color="processing" closable={false} __component_name="Tag">
                      {__$$eval(() =>
                        (() => {
                          const version = this.getCurrentVersion()?.version;
                          return version ? `${version}` : '';
                        })()
                      )}
                    </Tag>
                  </Space>
                </Col>
                <Col __component_name="Col">
                  <Dropdown.Button
                    ref={this._refsManager.linkRef('dropdown.button-eb1a5b1d')}
                    menu={{
                      items: [
                        {
                          key: 'open-in-new-page-preview',
                          label: this.i18n('i18n-scef9t49') /* 新窗口预览 */,
                        },
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
                    __events={{
                      eventList: [
                        {
                          name: 'menu.onClick',
                          disabled: true,
                          template:
                            "onDropDownClick({ item, key, keyPath, domEvent }, ${extParams}){\n// onDropDownClick\t点击 展开按钮 调用此函数 \nconsole.log('onDropDownClick', item, key, keyPath, domEvent);}",
                        },
                        {
                          name: 'onClick',
                          disabled: true,
                          template:
                            "onClick(event, ${extParams}){\n// onClick\t点击 左侧按钮 调用此函数 \nconsole.log('onDropDownClick', event);}",
                        },
                      ],
                      eventDataList: [
                        {
                          name: 'menu.onClick',
                          type: 'componentEvent',
                          relatedEventName: 'menuOnClick',
                        },
                        {
                          name: 'onClick',
                          type: 'componentEvent',
                          relatedEventName: 'onDesignPageBtnClick',
                        },
                      ],
                    }}
                    disabled={false}
                    placement="bottomRight"
                    __component_name="Dropdown.Button"
                    destroyPopupOnHide={true}
                  >
                    {this.i18n('i18n-prfr37uo') /* 设计组件 */}
                  </Dropdown.Button>
                </Col>
              </Row>
              <Row wrap={true} __component_name="Row">
                <Col
                  span={24}
                  style={{ width: '100%', height: 'calc(100vh - 160px)' }}
                  __component_name="Col"
                >
                  <Iframe
                    ref={this._refsManager.linkRef('iframe-5d8eb3fb')}
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
          ref={this._refsManager.linkRef('modal-58351f84')}
          mask={true}
          onOk={function () {
            return this.confirmDeleteVersion.apply(
              this,
              Array.prototype.slice.call(arguments).concat([])
            );
          }.bind(this)}
          open={__$$eval(() => this.state.deleteVersionConfirmModalOpen)}
          title="确认删除版本"
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
              {
                name: 'onCancel',
                type: 'componentEvent',
                relatedEventName: 'closeDeleteVersionConfirmModal',
              },
              { name: 'onOk', type: 'componentEvent', relatedEventName: 'confirmDeleteVersion' },
            ],
          }}
          centered={false}
          keyboard={true}
          onCancel={function () {
            return this.closeDeleteVersionConfirmModal.apply(
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
            ref={this._refsManager.linkRef('alert-abbb4bb6')}
            type="warning"
            message={__$$eval(() => `确定删除版本 v${this.getCurrentVersion()?.version} 吗？`)}
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
  const match = matchPath({ path: '/components/:id/versions' }, location.pathname);
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
        func: 'getSdkByAppId',
        params: function applyThis() {
          return this.match?.params?.appId;
        }.apply(self),
      }}
      sdkSwrFuncs={[
        {
          func: 'useGetComponent',
          params: function applyThis() {
            return {
              id: this.match?.params?.id,
              tree: 'main',
            };
          }.apply(self),
        },
        {
          func: 'useGetCurrentUser',
          params: undefined,
        },
      ]}
      render={dataProps => (
        <ComponentDetailVersions$$Page {...dataProps} self={self} appHelper={appHelper} />
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
