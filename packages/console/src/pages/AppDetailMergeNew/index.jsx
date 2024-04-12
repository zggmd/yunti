// 注意: 出码引擎注入的临时变量默认都以 "__$$" 开头，禁止在搭建的代码中直接访问。
// 例外：react 框架的导出名和各种组件名除外。
import React from 'react';

import {
  Page,
  Drawer,
  Row,
  Col,
  Menu,
  Flex,
  Collapse,
  Divider,
  Tabs,
  Typography,
  Button,
  Space,
  Card,
  FormilyForm,
  FormilySelect,
  FormilyInput,
  FormilyTextArea,
  FormilySwitch,
} from '@tenx-ui/materials';

import { MonacoDiffEditor } from '@yuntijs/ui-lowcode-materials';

import { TenxIconBranchGit, AntdIconArrowLeftOutlined } from '@tenx-ui/icon-materials';

import { useLocation, matchPath } from '@umijs/max';
import { DataProvider } from 'shared-components';
import qs from 'query-string';
import { getUnifiedHistory } from '@tenx-ui/utils/es/UnifiedLink/index.prod';

import utils, { RefsManager } from '../../utils/__utils';

import * as __$$i18n from '../../i18n';

import __$$constants from '../../__constants';

import './index.css';

class AppDetailMergeNew$$Page extends React.Component {
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
      conflict: {},
      diffData: {},
      diffTab: 'commits',
      selected: [],
      selectedSource: undefined,
      selectedTarget: undefined,
    };
  }

  $ = refName => {
    return this._refsManager.get(refName);
  };

  $$ = refName => {
    return this._refsManager.getAll(refName);
  };

  _setDeepValue(value, keyPath, obj) {
    if (!keyPath) {
      Object.assign(obj, value);
      return obj;
    }
    if (typeof keyPath === 'string') {
      keyPath = keyPath.split('.');
    }
    if (keyPath.length === 1) {
      obj[keyPath[0]] = {
        ...obj[keyPath[0]],
        ...value,
      };
    } else {
      const currentKey = keyPath.shift();
      if (!obj[currentKey] || typeof obj[currentKey] !== 'object') {
        obj[currentKey] = {};
      }
      this._setDeepValue(value, keyPath, obj[currentKey]);
    }
    return obj;
  }

  data() {
    return {
      list: this.props.useGetMergeRequests?.data?.getMergeRequests || [],
    };
  }

  editorData(isConfilct) {
    const data = this.fullDiffData();
    if (this.state.diffTab === 'compare')
      return (
        data.diffData || {
          dataDiff: [],
          schemaDiff: [],
        }
      );
    return {
      dataDiff: data.conflictData?.dataConflicts || [],
      schemaDiff: data.conflictData?.schemaConflicts || [],
    };
  }

  form(id) {
    return this.$(id || 'merge_form')?.formRef?.current?.form;
  }

  fullDiffData() {
    // if (true) {
    if (false) {
      return {};
    }
    return this.state.diffData?.diffData || {};
  }

  getCompareNum() {
    //对比的计数
    const data = this.fullDiffData()?.diffData;
    return (data?.dataDiff?.length || 0) + (data?.schemaDiff?.length || 0);
  }

  async getDiff() {
    if (!this.state.selectedSource || !this.state.selectedTarget) {
      return;
    }
    const res = await this.utils.bff.getBranchesDiff({
      sourceBranch: this.state.selectedSource,
      targetBranch: this.state.selectedTarget,
    });
    if (res?.getBranchesDiff?.commits?.length) {
      this.setDeepState(
        {
          diffData: res.getBranchesDiff,
        },
        'diffData'
      );
    }
  }

  getMenus() {
    const data = this.editorData();
    const initSelected = (() => {
      if (data.dataDiff?.length) {
        return [`diff-table-${data.dataDiff[0].tableName}`];
      }
      if (data.schemaDiff?.length) {
        return [`diff-schema-${data.schemaDiff[0].tableName || 0}`];
      }
      return [];
    })();
    const list = (() => {
      let l = [];
      let diffList = [];
      if (data.dataDiff?.length) {
        const children = data.dataDiff.map(diff => ({
          key: `diff-table-${diff.tableName}`,
          label: diff.tableName,
          icon: <div />,
          diff,
        }));
        l.push({
          type: 'group',
          label: '表',
          children,
        });
        diffList = [...diffList, ...children];
      }
      if (data.schemaDiff?.length) {
        const children = data.schemaDiff.map((diff, index) => ({
          key: `diff-schema-${diff.tableName || index}`,
          label: `schema-${diff.tableName || index}`,
          icon: <div />,
          diff,
        }));
        l.push({
          type: 'group',
          label: 'Schema',
          children,
        });
        diffList = [...diffList, ...children];
      }
      return {
        menuItems: l,
        diffList,
      };
    })();
    return {
      menuItems: list.menuItems,
      diffList: list.diffList,
      initSelected,
    };
  }

  initConflictData() {
    return {
      conflictDiffObj: this.state.conflict?.conflictDiffObj || this.editorData().dataDiff,
      conflictSchemaObj: this.state.conflict?.conflictSchemaObj || this.editorData().schemaDiff,
    };
  }

  onCancle(event) {
    this.history.go(-1);
  }

  onDiffTabChange(activeKey) {
    this.setDeepState({
      diffTab: activeKey,
    });
  }

  onEditorChange(input, event, { diff, diffIndex }) {
    const conflict = this.initConflictData();
    if (diff.key.startsWith('diff-table')) {
      conflict.conflictDiffObj[diffIndex] = {
        ...conflict.conflictDiffObj[diffIndex],
        final: input,
      };
    }
    if (diff.key.startsWith('diff-schema')) {
      conflict.conflictSchemaObj[diffIndex] = {
        ...conflict.conflictSchemaObj[diffIndex],
        final: input,
      };
    }
    this.setDeepState({
      conflict,
    });
  }

  onMenuClick({ item, key, keyPath, domEvent }) {
    this.setDeepState({
      selected: [key],
    });
    this.scroll(key);
  }

  onOk(event) {
    this.form()?.submit(async v => {
      v = {
        sourceBranch: v.sourceBranch,
        targetBranch: v.targetBranch,
        title: v.title,
        description: v.description,
        assigneeId: v.assigneeId,
        options: JSON.stringify({
          delSourceBranch: v.delSourceBranch ? 1 : 0,
        }),
      };
      const res = await this.utils.bff
        .createMergeRequest({
          mergeRequestInput: v,
        })
        .catch(err => {
          this.utils.notification.warnings({
            message: '新建合并请求失败',
            description: err.toString(),
          });
        });
      if (res?.createMergeRequest?.id) {
        this.utils.notification.success({
          message: '新建合并请求成功',
        });
        this.history.push(
          `/apps/${this.match?.params?.appId}/merge/${res?.createMergeRequest?.id}`
        );
      }
    });
  }

  onSourceChange(value) {
    this.setDeepState(
      {
        selectedSource: value,
      },
      null,
      this.getDiff
    );
  }

  onTargetChange(value) {
    this.setDeepState(
      {
        selectedTarget: value,
      },
      null,
      this.getDiff
    );
  }

  openMergeDrawer() {
    this.setState({
      drawer: {
        visible: true,
      },
    });
  }

  parseDiffData(obj = {}) {
    try {
      return JSON.stringify(this.utils.collectionSortKeys(obj), null, 2);
    } catch (e) {
      obj.toString();
    }
  }

  scroll(key) {
    const targetElement = document.getElementsByClassName(key)?.[0];
    targetElement &&
    targetElement.scrollIntoView?.({
      behavior: 'smooth',
    });
  }

  setDeepState(value, path, setStateCallback) {
    const state = this._setDeepValue(value, path, this.state);
    this.setState(state, setStateCallback);
    setTimeout(() => {
      // console.log('new state:', this.state)
    }, 200);
  }

  componentDidMount() {}

  render() {
    const __$$context = this._context || this;
    const { state } = __$$context;
    return (
      <Page>
        <Drawer
          __component_name="Drawer"
          destroyOnClose={true}
          mask={true}
          maskClosable={false}
          open={__$$eval(() => this.state.drawer.visible)}
          placement="right"
          title="新建合并请求"
          width="75%"
        >
          <Row __component_name="Row" wrap={true}>
            <Col __component_name="Col" span={24} />
            <Col __component_name="Col" span={24}>
              {!!__$$eval(
                () => this.state.diffTab === 'compare' || this.state.diffTab === 'conflict'
              ) && (
                <Row __component_name="Row" justify="space-between" wrap={false}>
                  <Col __component_name="Col" flex="250px">
                    <Menu
                      defaultOpenKeys={[]}
                      defaultSelectedKeys={[]}
                      forceSubMenuRender={false}
                      inlineCollapsed={false}
                      inlineIndent={0}
                      items={__$$eval(() => this.getMenus().menuItems)}
                      mode="inline"
                      multiple={false}
                      onClick={function () {
                        return this.onMenuClick.apply(
                          this,
                          Array.prototype.slice.call(arguments).concat([])
                        );
                      }.bind(this)}
                      openKeys={[]}
                      selectable={true}
                      selectedKeys={__$$eval(() => this.state.selected)}
                      subMenuCloseDelay={0}
                      subMenuOpenDelay={0}
                      theme="light"
                      triggerSubMenuAction="hover"
                    />
                  </Col>
                  <Col __component_name="Col" flex="auto" style={{}}>
                    <Flex
                      __component_name="Flex"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        maxHeight: '600px',
                        overflowY: 'auto',
                        width: '100%',
                      }}
                    >
                      {__$$evalArray(() => this.getMenus().diffList).map((diff, diffIndex) =>
                        (__$$context => (
                          <Flex
                            __component_name="Flex"
                            key={null}
                            ref={this._refsManager.linkRef('[object Object]')}
                            rootClassName={__$$eval(() => diff.key)}
                          >
                            <Collapse
                              __component_name="Collapse"
                              defaultActiveKey={__$$eval(() => diff.key)}
                              expandIconPosition="right"
                              ghost={false}
                              items={[
                                {
                                  _unsafe_MixedSetter_children_select: 'SlotSetter',
                                  _unsafe_MixedSetter_label_select: 'VariableSetter',
                                  children: (
                                    <MonacoDiffEditor
                                      __component_name="MonacoDiffEditor"
                                      contextmenu={true}
                                      height="200px"
                                      language="json"
                                      minimapEnabled={false}
                                      onChange={function () {
                                        return this.onEditorChange.apply(
                                          this,
                                          Array.prototype.slice.call(arguments).concat([
                                            {
                                              diff: diff,
                                              diffIndex: diffIndex,
                                            },
                                          ])
                                        );
                                      }.bind(__$$context)}
                                      original={__$$eval(() =>
                                        __$$context.parseDiffData(diff.diff.our)
                                      )}
                                      readOnly={__$$eval(
                                        () => __$$context.state.diffTab === 'compare'
                                      )}
                                      supportFullScreen={true}
                                      value={__$$eval(() =>
                                        __$$context.parseDiffData(diff.diff.their)
                                      )}
                                      version="0.45.0"
                                      width="100%"
                                    />
                                  ),
                                  key: __$$eval(() => diff.key),
                                  label: __$$eval(() => diff.label),
                                },
                              ]}
                              style={{ width: '100%' }}
                            />
                          </Flex>
                        ))(__$$createChildContext(__$$context, { diff, diffIndex }))
                      )}
                    </Flex>
                  </Col>
                </Row>
              )}
            </Col>
          </Row>
          <Row
            __component_name="Row"
            style={{ bottom: '0', position: 'absolute', width: '100%' }}
            wrap={true}
          >
            <Col __component_name="Col" span={24}>
              <Divider __component_name="Divider" dashed={false} defaultOpen={false} mode="line" />
            </Col>
            <Col
              __component_name="Col"
              span={24}
              style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '32px' }}
            />
            <Col
              __component_name="Col"
              flex="auto"
              style={{ alignItems: 'center', display: 'flex', justifyContent: 'flex-end' }}
            />
          </Row>
        </Drawer>
        {!!__$$eval(() => this.state.detail.visible) && (
          <Drawer
            __component_name="Drawer"
            destroyOnClose={true}
            mask={true}
            maskClosable={false}
            onClose={function () {
              return this.onCloseDetail.apply(
                this,
                Array.prototype.slice.call(arguments).concat([])
              );
            }.bind(this)}
            open={true}
            placement="right"
            size="large"
            title={
              <Row __component_name="Row" wrap={false}>
                <Col
                  __component_name="Col"
                  flex="60px"
                  style={{ alignItems: 'center', display: 'flex', justifyContent: 'center' }}
                >
                  <TenxIconBranchGit __component_name="TenxIconBranchGit" size={40} />
                </Col>
                <Col __component_name="Col" flex="auto">
                  <Row __component_name="Row" wrap={false}>
                    <Col __component_name="Col" flex="auto">
                      <Row __component_name="Row" wrap={true}>
                        <Col __component_name="Col" span={24}>
                          <Typography.Title
                            __component_name="Typography.Title"
                            bold={true}
                            bordered={false}
                            ellipsis={true}
                            level={1}
                          >
                            {__$$eval(() => this.state.detail?.data?.title || '-')}
                          </Typography.Title>
                        </Col>
                        <Col __component_name="Col" span={24}>
                          <Space
                            __component_name="Space"
                            align="center"
                            direction="horizontal"
                            style={{ fontWeight: '400' }}
                          >
                            <Typography.Text
                              __component_name="Typography.Text"
                              disabled={false}
                              ellipsis={{
                                tooltip: {
                                  _unsafe_MixedSetter_title_select: 'VariableSetter',
                                  title: __$$eval(
                                    () => this.state.detail?.data?.sourceBranch?.name
                                  ),
                                },
                              }}
                              strong={false}
                              style={{ fontSize: '', maxWidth: '300px' }}
                              type="default"
                            >
                              {__$$eval(
                                () =>
                                  `源分支：${this.state.detail?.data?.sourceBranch?.name || '-'}`
                              )}
                            </Typography.Text>
                            <Divider
                              __component_name="Divider"
                              dashed={false}
                              defaultOpen={false}
                              mode="default"
                              type="vertical"
                            />
                            <Typography.Text
                              __component_name="Typography.Text"
                              disabled={false}
                              ellipsis={{
                                tooltip: {
                                  _unsafe_MixedSetter_title_select: 'VariableSetter',
                                  title: __$$eval(
                                    () => this.state.detail?.data?.targetBranch?.name
                                  ),
                                },
                              }}
                              strong={false}
                              style={{ fontSize: '', maxWidth: '200px', width: '300px' }}
                            >
                              {__$$eval(
                                () =>
                                  `目标分支：${this.state.detail?.data?.targetBranch?.name || '-'}`
                              )}
                            </Typography.Text>
                            <Divider
                              __component_name="Divider"
                              dashed={false}
                              defaultOpen={false}
                              mode="default"
                              type="vertical"
                            />
                            <Typography.Text
                              __component_name="Typography.Text"
                              disabled={false}
                              ellipsis={{
                                tooltip: {
                                  _unsafe_MixedSetter_title_select: 'VariableSetter',
                                  title: __$$eval(() => this.state.detail?.data?.description),
                                },
                              }}
                              strong={false}
                              style={{ fontSize: '', width: '400px' }}
                            >
                              {__$$eval(
                                () => `描述：${this.state.detail?.data?.description || '-'}`
                              )}
                            </Typography.Text>
                          </Space>
                        </Col>
                      </Row>
                    </Col>
                    <Col
                      __component_name="Col"
                      flex="200px"
                      style={{ alignItems: 'center', display: 'flex', justifyContent: 'flex-end' }}
                    >
                      <Space __component_name="Space" align="center" direction="horizontal">
                        <Button
                          __component_name="Button"
                          block={false}
                          danger={false}
                          disabled={false}
                          ghost={false}
                          onClick={function () {
                            return this.doMerge.apply(
                              this,
                              Array.prototype.slice.call(arguments).concat([])
                            );
                          }.bind(this)}
                          shape="default"
                        >
                          合并
                        </Button>
                        <Button
                          __component_name="Button"
                          block={false}
                          danger={false}
                          disabled={false}
                          ghost={false}
                          onClick={function () {
                            return this.closeMergeRequest.apply(
                              this,
                              Array.prototype.slice.call(arguments).concat([])
                            );
                          }.bind(this)}
                          shape="default"
                        >
                          关闭
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                </Col>
              </Row>
            }
            width="75%"
          >
            <Row __component_name="Row" wrap={true}>
              <Col __component_name="Col" span={24}>
                <Tabs
                  __component_name="Tabs"
                  activeKey={__$$eval(() => this.state.diffTab)}
                  destroyInactiveTabPane="true"
                  items={[
                    {
                      _unsafe_MixedSetter_label_select: 'VariableSetter',
                      children: __$$evalArray(() => this.fullDiffData()?.commits || []).map(
                        (commit, commitIndex) =>
                          (__$$context => (
                            <Row __component_name="Row" wrap={true}>
                              <Col __component_name="Col" span={24}>
                                <Row
                                  __component_name="Row"
                                  gutter={[null, 0]}
                                  justify="start"
                                  wrap={true}
                                >
                                  <Col __component_name="Col" span={24}>
                                    <Row __component_name="Row" wrap={false}>
                                      <Col __component_name="Col" flex="auto">
                                        <Typography.Text
                                          __component_name="Typography.Text"
                                          disabled={false}
                                          ellipsis={true}
                                          strong={false}
                                          style={{ fontSize: '14px' }}
                                          type="colorTextBase"
                                        >
                                          {__$$eval(() => commit.message || '-')}
                                        </Typography.Text>
                                      </Col>
                                      <Col __component_name="Col" flex="270px">
                                        <Typography.Text
                                          __component_name="Typography.Text"
                                          copyable={__$$eval(() => commit.hash || '')}
                                          disabled={false}
                                          ellipsis={true}
                                          strong={false}
                                          style={{ fontSize: '' }}
                                        >
                                          {__$$eval(() => commit.hash || '-')}
                                        </Typography.Text>
                                      </Col>
                                    </Row>
                                  </Col>
                                  <Col __component_name="Col" span={24}>
                                    <Row __component_name="Row" wrap={true}>
                                      <Col __component_name="Col">
                                        <Typography.Text
                                          __component_name="Typography.Text"
                                          disabled={false}
                                          ellipsis={true}
                                          strong={false}
                                          style={{ fontSize: '' }}
                                        >
                                          {__$$eval(() => commit.committer)}
                                        </Typography.Text>
                                      </Col>
                                      <Col __component_name="Col">
                                        <Typography.Text
                                          __component_name="Typography.Text"
                                          disabled={false}
                                          ellipsis={true}
                                          strong={false}
                                          style={{ fontSize: '' }}
                                          type="colorTextTertiary"
                                        >
                                          authored
                                        </Typography.Text>
                                      </Col>
                                    </Row>
                                  </Col>
                                </Row>
                              </Col>
                              <Col
                                __component_name="Col"
                                span={24}
                                style={{
                                  borderBottomColor: '#f2f2f2',
                                  borderBottomStyle: 'solid',
                                  borderBottomWidth: '1px',
                                }}
                              />
                            </Row>
                          ))(__$$createChildContext(__$$context, { commit, commitIndex }))
                      ),
                      key: 'commits',
                      label: __$$eval(
                        () => `Commits(${this.fullDiffData()?.commits?.length || 0})`
                      ),
                    },
                    {
                      _unsafe_MixedSetter_label_select: 'VariableSetter',
                      hidden: false,
                      key: 'compare',
                      label: __$$eval(() => `对比(${this.getCompareNum(this.editorData())})`),
                    },
                    {
                      _unsafe_MixedSetter_label_select: 'VariableSetter',
                      key: 'conflict',
                      label: __$$eval(() => `解决冲突(${this.getConflictNum()})`),
                    },
                  ]}
                  onChange={function () {
                    return this.onDiffTabChange.apply(
                      this,
                      Array.prototype.slice.call(arguments).concat([])
                    );
                  }.bind(this)}
                  size="default"
                  style={{ marginTop: '0px' }}
                  tabPosition="top"
                  type="line"
                />
              </Col>
              <Col __component_name="Col" span={24}>
                {!!__$$eval(
                  () => this.state.diffTab === 'compare' || this.state.diffTab === 'conflict'
                ) && (
                  <Row __component_name="Row" justify="space-between" wrap={false}>
                    <Col __component_name="Col" flex="250px">
                      <Menu
                        defaultOpenKeys={[]}
                        defaultSelectedKeys={[]}
                        forceSubMenuRender={false}
                        inlineCollapsed={false}
                        inlineIndent={0}
                        items={__$$eval(() => this.getMenus().menuItems)}
                        mode="inline"
                        multiple={false}
                        onClick={function () {
                          return this.onMenuClick.apply(
                            this,
                            Array.prototype.slice.call(arguments).concat([])
                          );
                        }.bind(this)}
                        openKeys={[]}
                        selectable={true}
                        selectedKeys={__$$eval(() => this.state.selected)}
                        subMenuCloseDelay={0}
                        subMenuOpenDelay={0}
                        theme="light"
                        triggerSubMenuAction="hover"
                      />
                    </Col>
                    <Col __component_name="Col" flex="auto" style={{}}>
                      <Flex
                        __component_name="Flex"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          maxHeight: '600px',
                          overflowY: 'auto',
                          width: '100%',
                        }}
                      >
                        {__$$evalArray(() => this.getMenus().diffList).map((diff, diffIndex) =>
                          (__$$context => (
                            <Flex
                              __component_name="Flex"
                              key={null}
                              ref={this._refsManager.linkRef('[object Object]')}
                              rootClassName={__$$eval(() => diff.key)}
                            >
                              <Collapse
                                __component_name="Collapse"
                                defaultActiveKey={__$$eval(() => diff.key)}
                                expandIconPosition="right"
                                ghost={false}
                                items={[
                                  {
                                    _unsafe_MixedSetter_children_select: 'SlotSetter',
                                    _unsafe_MixedSetter_label_select: 'VariableSetter',
                                    children: (
                                      <MonacoDiffEditor
                                        __component_name="MonacoDiffEditor"
                                        contextmenu={true}
                                        height="200px"
                                        language="json"
                                        minimapEnabled={false}
                                        onChange={function () {
                                          return this.onEditorChange.apply(
                                            this,
                                            Array.prototype.slice.call(arguments).concat([
                                              {
                                                diff: diff,
                                                diffIndex: diffIndex,
                                              },
                                            ])
                                          );
                                        }.bind(__$$context)}
                                        original={__$$eval(() =>
                                          __$$context.parseDiffData(diff.diff.our)
                                        )}
                                        readOnly={__$$eval(
                                          () => __$$context.state.diffTab === 'compare'
                                        )}
                                        supportFullScreen={true}
                                        value={__$$eval(() =>
                                          __$$context.parseDiffData(diff.diff.their)
                                        )}
                                        version="0.45.0"
                                        width="100%"
                                      />
                                    ),
                                    key: __$$eval(() => diff.key),
                                    label: __$$eval(() => diff.label),
                                  },
                                ]}
                                style={{ width: '100%' }}
                              />
                            </Flex>
                          ))(__$$createChildContext(__$$context, { diff, diffIndex }))
                        )}
                        {!!__$$eval(() => this.state.diffTab === 'conflict') && (
                          <Button
                            __component_name="Button"
                            block={false}
                            danger={false}
                            disabled={false}
                            ghost={false}
                            onClick={function () {
                              return this.onResloveConflict.apply(
                                this,
                                Array.prototype.slice.call(arguments).concat([])
                              );
                            }.bind(this)}
                            shape="default"
                            style={{ marginTop: '8xpx', width: '80px' }}
                            type="primary"
                          >
                            解决冲突
                          </Button>
                        )}
                      </Flex>
                    </Col>
                  </Row>
                )}
              </Col>
            </Row>
          </Drawer>
        )}
        <Button.Back
          __component_name="Button.Back"
          name="合并列表"
          path={__$$eval(() => `/apps/${this.match?.params?.appId}/merge`)}
          title="新建合并请求"
          type="ghost"
        />
        <Card
          __component_name="Card"
          actions={[]}
          bordered={false}
          hoverable={false}
          loading={false}
          size="default"
          style={{ height: 'calc(100% -8px)', marginTop: '8px' }}
          title=""
          type="default"
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
            formHelper={{ autoFocus: true }}
            ref={this._refsManager.linkRef('merge_form')}
          >
            <Row __component_name="Row" justify="space-between" wrap={false}>
              <Col __component_name="Col">
                <Typography.Text
                  __component_name="Typography.Text"
                  disabled={false}
                  ellipsis={true}
                  strong={false}
                  style={{
                    color: '#ff4d4f',
                    fontSize: '12px',
                    marginInlineEnd: '4px',
                    paddingRight: '3px',
                  }}
                >
                  *
                </Typography.Text>
                <Typography.Text
                  __component_name="Typography.Text"
                  disabled={false}
                  ellipsis={true}
                  strong={false}
                  style={{ fontSize: '' }}
                >
                  分支
                </Typography.Text>
              </Col>
              <Col __component_name="Col" span={20}>
                <Row __component_name="Row" wrap={true}>
                  <Col __component_name="Col" span={11}>
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
                          allowClear: true,
                          disabled: false,
                          onChange: function () {
                            return this.onTargetChange.apply(
                              this,
                              Array.prototype.slice.call(arguments).concat([])
                            );
                          }.bind(this),
                          placeholder: '请选择目标分支',
                          showSearch: true,
                        },
                      }}
                      decoratorProps={{
                        'x-decorator-props': { labelEllipsis: true, layout: 'horizontal' },
                      }}
                      fieldProps={{
                        '_unsafe_MixedSetter_enum_select': 'ArraySetter',
                        'enum': [],
                        'name': 'targetBranch',
                        'required': true,
                        'title': '',
                        'x-validator': [],
                      }}
                      style={{ marginLeft: '-3px' }}
                    />
                  </Col>
                  <Col __component_name="Col" span={1} style={{ textAlign: 'center' }}>
                    <AntdIconArrowLeftOutlined __component_name="AntdIconArrowLeftOutlined" />
                  </Col>
                  <Col __component_name="Col" span={12}>
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
                          allowClear: true,
                          disabled: false,
                          onChange: function () {
                            return this.onSourceChange.apply(
                              this,
                              Array.prototype.slice.call(arguments).concat([])
                            );
                          }.bind(this),
                          placeholder: '请选择源分支',
                          showSearch: true,
                        },
                      }}
                      decoratorProps={{
                        'x-decorator-props': { labelEllipsis: true, layout: 'horizontal' },
                      }}
                      fieldProps={{
                        '_unsafe_MixedSetter_enum_select': 'ArraySetter',
                        'enum': [],
                        'name': 'sourceBranch',
                        'required': true,
                        'title': '',
                        'x-validator': [],
                      }}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
            <FormilyInput
              __component_name="FormilyInput"
              componentProps={{ 'x-component-props': { placeholder: '请输入标题' } }}
              decoratorProps={{ 'x-decorator-props': { labelEllipsis: true } }}
              fieldProps={{
                'description': '',
                'name': 'title',
                'required': true,
                'title': '标题',
                'x-validator': [],
              }}
            />
            <FormilyTextArea
              __component_name="FormilyTextArea"
              componentProps={{ 'x-component-props': { placeholder: '请输入描述' } }}
              decoratorProps={{ 'x-decorator-props': { labelEllipsis: true, tooltip: '' } }}
              fieldProps={{
                'name': 'description',
                'required': false,
                'title': '描述',
                'x-component': 'Input.TextArea',
                'x-validator': [],
              }}
            />
            <FormilySelect
              __component_name="FormilySelect"
              componentProps={{
                'x-component-props': {
                  _sdkSwrGetFunc: {
                    func: __$$eval(() => this.utils.bff.getUsers),
                    label: 'name',
                    resKey: __$$eval(() => ['users']),
                    value: 'id',
                  },
                  allowClear: false,
                  disabled: false,
                  optionFilterProp: 'label',
                  placeholder: '请选择经办人',
                  showSearch: true,
                },
              }}
              decoratorProps={{ 'x-decorator-props': { labelEllipsis: true } }}
              fieldProps={{
                '_unsafe_MixedSetter_enum_select': 'ArraySetter',
                'enum': [],
                'name': 'assigneeId',
                'required': true,
                'title': '经办人',
                'x-validator': [],
              }}
            />
            <FormilySwitch
              __component_name="FormilySwitch"
              componentProps={{ 'x-component-props': { disabled: false, loading: false } }}
              decoratorProps={{ 'x-decorator-props': { labelEllipsis: true } }}
              fieldProps={{
                'name': 'delSourceBranch',
                'title': '合并后删除源分支',
                'x-validator': [],
              }}
            />
          </FormilyForm>
          <Row __component_name="Row" wrap={true}>
            <Col __component_name="Col" span={24}>
              <Tabs
                __component_name="Tabs"
                activeKey={__$$eval(() => this.state.diffTab)}
                destroyInactiveTabPane="true"
                items={[
                  {
                    _unsafe_MixedSetter_label_select: 'VariableSetter',
                    children: (
                      <Flex
                        __component_name="Flex"
                        style={{
                          display: 'block',
                          maxHeight: 'calc(100vh - 519px)',
                          overflowX: 'hidden',
                          overflowY: 'auto',
                        }}
                      >
                        {__$$evalArray(() => this.fullDiffData()?.commits || []).map(
                          (commit, commitIndex) =>
                            (__$$context => (
                              <Row __component_name="Row" style={{}} wrap={true}>
                                <Col __component_name="Col" span={24}>
                                  <Row
                                    __component_name="Row"
                                    gutter={[null, 0]}
                                    justify="start"
                                    wrap={true}
                                  >
                                    <Col __component_name="Col" span={24}>
                                      <Row __component_name="Row" wrap={false}>
                                        <Col __component_name="Col" flex="auto">
                                          <Typography.Text
                                            __component_name="Typography.Text"
                                            disabled={false}
                                            ellipsis={true}
                                            strong={false}
                                            style={{ fontSize: '14px' }}
                                            type="colorTextBase"
                                          >
                                            {__$$eval(() => commit.message || '-')}
                                          </Typography.Text>
                                        </Col>
                                        <Col __component_name="Col" flex="270px">
                                          <Typography.Text
                                            __component_name="Typography.Text"
                                            copyable={__$$eval(() => commit.hash || '')}
                                            disabled={false}
                                            ellipsis={true}
                                            strong={false}
                                            style={{ fontSize: '' }}
                                          >
                                            {__$$eval(() => commit.hash || '-')}
                                          </Typography.Text>
                                        </Col>
                                      </Row>
                                    </Col>
                                    <Col __component_name="Col" span={24}>
                                      <Row __component_name="Row" wrap={true}>
                                        <Col __component_name="Col">
                                          <Typography.Text
                                            __component_name="Typography.Text"
                                            disabled={false}
                                            ellipsis={true}
                                            strong={false}
                                            style={{ fontSize: '' }}
                                          >
                                            {__$$eval(() => commit.committer)}
                                          </Typography.Text>
                                        </Col>
                                        <Col __component_name="Col">
                                          <Typography.Text
                                            __component_name="Typography.Text"
                                            disabled={false}
                                            ellipsis={true}
                                            strong={false}
                                            style={{ fontSize: '' }}
                                            type="colorTextTertiary"
                                          >
                                            authored
                                          </Typography.Text>
                                        </Col>
                                      </Row>
                                    </Col>
                                  </Row>
                                </Col>
                                <Col
                                  __component_name="Col"
                                  span={24}
                                  style={{
                                    borderBottomColor: '#f2f2f2',
                                    borderBottomStyle: 'solid',
                                    borderBottomWidth: '1px',
                                  }}
                                />
                              </Row>
                            ))(__$$createChildContext(__$$context, { commit, commitIndex }))
                        )}
                      </Flex>
                    ),
                    key: 'commits',
                    label: __$$eval(() => `Commits(${this.fullDiffData()?.commits?.length || 0})`),
                  },
                  {
                    _unsafe_MixedSetter_label_select: 'VariableSetter',
                    hidden: false,
                    key: 'compare',
                    label: __$$eval(() => `对比(${this.getCompareNum(this.editorData())})`),
                  },
                ]}
                onChange={function () {
                  return this.onDiffTabChange.apply(
                    this,
                    Array.prototype.slice.call(arguments).concat([])
                  );
                }.bind(this)}
                size="default"
                style={{ marginTop: '0px' }}
                tabPosition="top"
                type="line"
              />
            </Col>
            <Col __component_name="Col" span={24} style={{ display: 'block' }}>
              {!!__$$eval(
                () => this.state.diffTab === 'compare' || this.state.diffTab === 'conflict'
              ) && (
                <Row __component_name="Row" justify="space-between" wrap={false}>
                  <Col __component_name="Col" flex="250px">
                    <Menu
                      defaultOpenKeys={[]}
                      defaultSelectedKeys={[]}
                      forceSubMenuRender={false}
                      inlineCollapsed={false}
                      inlineIndent={0}
                      items={__$$eval(() => this.getMenus().menuItems)}
                      mode="inline"
                      multiple={false}
                      onClick={function () {
                        return this.onMenuClick.apply(
                          this,
                          Array.prototype.slice.call(arguments).concat([])
                        );
                      }.bind(this)}
                      openKeys={[]}
                      selectable={true}
                      selectedKeys={__$$eval(() => this.state.selected)}
                      subMenuCloseDelay={0}
                      subMenuOpenDelay={0}
                      theme="light"
                      triggerSubMenuAction="hover"
                    />
                  </Col>
                  <Col __component_name="Col" flex="auto" style={{}}>
                    <Flex
                      __component_name="Flex"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        maxHeight: 'calc(100vh - 500px)',
                        overflowY: 'auto',
                        width: '100%',
                      }}
                    >
                      {__$$evalArray(() => this.getMenus().diffList).map((diff, diffIndex) =>
                        (__$$context => (
                          <Flex
                            __component_name="Flex"
                            key={null}
                            ref={this._refsManager.linkRef('[object Object]')}
                            rootClassName={__$$eval(() => diff.key)}
                          >
                            <Collapse
                              __component_name="Collapse"
                              defaultActiveKey={__$$eval(() => diff.key)}
                              expandIconPosition="right"
                              ghost={false}
                              items={[
                                {
                                  _unsafe_MixedSetter_children_select: 'SlotSetter',
                                  _unsafe_MixedSetter_label_select: 'VariableSetter',
                                  children: (
                                    <MonacoDiffEditor
                                      __component_name="MonacoDiffEditor"
                                      contextmenu={true}
                                      height="550px"
                                      language="json"
                                      minimapEnabled={false}
                                      onChange={function () {
                                        return this.onEditorChange.apply(
                                          this,
                                          Array.prototype.slice.call(arguments).concat([
                                            {
                                              diff: diff,
                                              diffIndex: diffIndex,
                                            },
                                          ])
                                        );
                                      }.bind(__$$context)}
                                      original={__$$eval(() =>
                                        __$$context.parseDiffData(
                                          diff.diff.tableName === 'pages'
                                            ? diff.diff.our.content
                                            : diff.diff.our
                                        )
                                      )}
                                      readOnly={__$$eval(
                                        () => __$$context.state.diffTab === 'compare'
                                      )}
                                      supportFullScreen={true}
                                      value={__$$eval(() =>
                                        __$$context.parseDiffData(
                                          diff.diff.tableName === 'pages'
                                            ? diff.diff.their.content
                                            : diff.diff.their
                                        )
                                      )}
                                      version="0.45.0"
                                      width="100%"
                                    />
                                  ),
                                  key: __$$eval(() => diff.key),
                                  label: __$$eval(() => diff.label),
                                },
                              ]}
                              style={{ width: '100%' }}
                            />
                          </Flex>
                        ))(__$$createChildContext(__$$context, { diff, diffIndex }))
                      )}
                    </Flex>
                  </Col>
                </Row>
              )}
            </Col>
          </Row>
          <Space
            __component_name="Space"
            align="center"
            direction="horizontal"
            style={{ bottom: '0', marginBottom: '8px', marginTop: '8px', position: 'absolute' }}
          >
            <Button
              __component_name="Button"
              block={false}
              danger={false}
              disabled={false}
              ghost={false}
              onClick={function () {
                return this.onCancle.apply(this, Array.prototype.slice.call(arguments).concat([]));
              }.bind(this)}
              shape="default"
            >
              取消
            </Button>
            <Button
              __component_name="Button"
              block={false}
              danger={false}
              disabled={false}
              ghost={false}
              onClick={function () {
                return this.onOk.apply(this, Array.prototype.slice.call(arguments).concat([]));
              }.bind(this)}
              shape="default"
              type="primary"
            >
              确定
            </Button>
          </Space>
        </Card>
      </Page>
    );
  }
}

const PageWrapper = (props = {}) => {
  const location = useLocation();
  const history = getUnifiedHistory();
  const match = matchPath({ path: '/apps/:appId/merge/new' }, location.pathname);
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
          func: 'useGetMergeRequests',
          params: function applyThis() {
            return (() => {
              const status = JSON.parse(
                new URL('https://a.com' + this.location.search || '').searchParams.get('_search') ||
                '{}'
              )?.status;
              const body = {
                appId: this.match?.params?.appId,
              };
              if (status && status !== 'Openning') body.status = status;
              return {
                searchParam: body,
              };
            })();
          }.apply(self),
          enableLocationSearch: function applyThis() {
            return true;
          }.apply(self),
        },
        {
          func: 'useGetUsers',
          params: undefined,
          enableLocationSearch: undefined,
        },
      ]}
      render={dataProps => (
        <AppDetailMergeNew$$Page {...props} {...dataProps} self={self} appHelper={appHelper} />
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
