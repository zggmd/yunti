// 注意: 出码引擎注入的临时变量默认都以 "__$$" 开头，禁止在搭建的代码中直接访问。
// 例外：react 框架的导出名和各种组件名除外。
import React from 'react';

import {
  Page,
  Typography,
  Button,
  Card,
  Row,
  Col,
  Space,
  Status,
  Divider,
  Tabs,
  Menu,
  Flex,
  Collapse,
} from '@tenx-ui/materials';

import LccComponentSbva0 from 'confirm';

import { TenxIconBranchGit } from '@tenx-ui/icon-materials';

import { MonacoDiffEditor } from '@yuntijs/ui-lowcode-materials';

import { useLocation, matchPath } from '@umijs/max';
import { DataProvider } from 'shared-components';
import qs from 'query-string';
import { getUnifiedHistory } from '@tenx-ui/utils/es/UnifiedLink/index.prod';

import utils, { RefsManager } from '../../utils/__utils';

import * as __$$i18n from '../../i18n';

import __$$constants from '../../__constants';

import './index.css';

class AppDetailMergeDetail$$Page extends React.Component {
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
      confirm: {},
      conflict: {},
      detail: {
        visible: false,
        data: {},
      },
      diffTab: 'commits',
      drawer: {
        visible: false,
        data: {},
      },
      MRType: 'openning',
      selected: [],
    };

    this.mock = {
      list: [],
      detail: {},
    };
  }

  $ = refName => {
    return this._refsManager.get(refName);
  };

  $$ = refName => {
    return this._refsManager.getAll(refName);
  };

  _constants() {
    return {
      statusList: [
        {
          children: '已合并',
          id: 'Merged',
          type: 'success',
        },
        {
          children: '待合并',
          id: 'Openning',
          type: 'warning',
        },
        {
          children: '已关闭',
          id: 'Closed',
          type: 'disabled',
        },
        {
          children: '草稿',
          id: 'Draft',
          type: 'warning',
        },
        {
          children: '冲突',
          id: 'Conflicted',
          type: 'error',
        },
        {
          children: '未知',
          id: 'no',
          type: 'disabled',
        },
      ],
    };
  }

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

  async closeMergeRequest() {
    const res = await this.utils.bff
      .closeMergeRequests({
        id: this.fullDiffData()?.id,
      })
      .catch(e => {
        console.log('e', {
          ...e,
        });
      });
    if (res?.closeMergeRequests?.id) {
      this.utils.notification.success({
        message: '合并请求已关闭',
      });
      this.refreshDetail();
    }
  }

  confirmCloseMr() {
    this.setState({
      confirm: {
        id: new Date().getTime(),
        title: '关闭合并请求',
        content: `确定关闭合并请求：${this.state.detail?.data?.title || '-'} ？`,
        onOk: this.closeMergeRequest.bind(this),
      },
    });
  }

  confirmDoMerge() {
    this.setState({
      confirm: {
        id: new Date().getTime(),
        title: '合并',
        content: `确定将 ${this.state.detail?.data?.sourceBranch?.name || '-'} 分支合并到 ${
          this.state.detail?.data?.targetBranch?.name || '-'
        } 分支吗？`,
        onOk: this.doMerge.bind(this),
      },
    });
  }

  confirmResolveConflict() {
    this.setState({
      confirm: {
        id: new Date().getTime(),
        title: '解决冲突',
        content: `将使用右侧编辑器的内容作为最终数据`,
        onOk: this.onResloveConflict.bind(this),
      },
    });
  }

  async doMerge() {
    const res = await this.utils.bff
      .mergeRequests({
        id: this.fullDiffData()?.id,
      })
      .catch(e => {
        console.log('e', {
          ...e,
        });
      });
    if (res?.mergeRequests?.result === 'ok') {
      this.utils.notification.success({
        message: '合并完成',
      });
      this.refreshDetail();
    }
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

  fullDiffData() {
    return this.state.detail?.data || {};
  }

  getbranches(isSource) {
    return (
      this.props.useGetApp?.data?.app?.branches?.map(branch => ({
        label: branch?.displayName,
        value: branch?.name,
      })) || []
    );
  }

  getCompareNum() {
    //对比的计数
    const data = this.fullDiffData()?.diffData;
    return (data?.dataDiff?.length || 0) + (data?.schemaDiff?.length || 0);
  }

  getConflictNum() {
    //对比的计数
    const data = this.fullDiffData()?.conflictData;
    return (data?.dataConflicts?.length || 0) + (data?.schemaConflicts?.length || 0);
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
        final: {
          ...diff.diff.their,
          content: input,
        },
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

  async onResloveConflict(event) {
    const data = this.initConflictData();
    const body = {
      id: this.fullDiffData()?.id,
      conflictData: {
        dataConflicts: data.conflictDiffObj?.map(diff => {
          let their = diff?.final || diff?.their;
          if (typeof their === 'string') {
            their = JSON.parse(their);
          }
          return {
            tableName: diff?.tableName,
            their,
          };
        }),
        schemaConflicts: data.conflictSchemaObj?.map(diff => {
          let their = diff?.final || diff?.their;
          if (typeof their === 'string') {
            their = JSON.parse(their);
          }
          return {
            tableName: diff?.tableName,
            their,
          };
        }),
      },
    };
    const res = await this.utils.bff.resolveConflict({
      conflictResolveInput: body,
    });
    if (res?.resolveConflict?.result === 'ok') {
      this.utils.notification.success({
        message: '解决冲突完成',
      });
      this.refreshDetail();
    }
  }

  parseDiffData(obj = {}) {
    try {
      return JSON.stringify(this.utils.collectionSortKeys(obj), null, 2);
    } catch (e) {
      obj.toString();
    }
  }

  async refreshDetail() {
    this.setDeepState(
      {
        visible: true,
        data: this.mock.detail || {},
      },
      'detail'
    );
    const res = await this.utils.bff.getDetailMergeRequest({
      id: parseInt(this.match?.params?.mergeId),
    });
    this.setDeepState(
      {
        data: res?.getMergeRequest,
      },
      'detail'
    );
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

  componentDidMount() {
    this.refreshDetail();
  }

  render() {
    const __$$context = this._context || this;
    const { state } = __$$context;
    return (
      <Page>
        <LccComponentSbva0
          __component_name="LccComponentSbva0"
          data={__$$eval(() => this.state.confirm)}
        />
        <Typography.Title
          __component_name="Typography.Title"
          bold={true}
          bordered={false}
          children=""
          ellipsis={true}
          level={1}
        />
        <Button.Back
          __component_name="Button.Back"
          children=""
          name="合并列表"
          path={__$$eval(() => `/apps/${this.match?.params?.appId}/merge`)}
          style={{}}
          title="合并详情"
          type="ghost"
        />
        <Card
          __component_name="Card"
          actions={[]}
          bordered={false}
          hoverable={false}
          loading={false}
          size="default"
          style={{ marginTop: '8px' }}
          type="default"
        >
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
                      <Space __component_name="Space" align="center" direction="horizontal">
                        <Typography.Title
                          __component_name="Typography.Title"
                          bold={true}
                          bordered={false}
                          ellipsis={true}
                          level={1}
                          style={{}}
                        >
                          {__$$eval(() => this.state.detail?.data?.title || '-')}
                        </Typography.Title>
                        <Status
                          __component_name="Status"
                          id={__$$eval(() => this.state.detail?.data?.mergeRequestStatus || 'no')}
                          style={{}}
                          types={__$$eval(() => this._constants().statusList)}
                        />
                      </Space>
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
                              title: __$$eval(() => this.state.detail?.data?.sourceBranch?.name),
                            },
                          }}
                          strong={false}
                          style={{ fontSize: '', maxWidth: '300px' }}
                          type="default"
                        >
                          {__$$eval(
                            () => `源分支：${this.state.detail?.data?.sourceBranch?.name || '-'}`
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
                              title: __$$eval(() => this.state.detail?.data?.targetBranch?.name),
                            },
                          }}
                          strong={false}
                          style={{ fontSize: '', maxWidth: '200px', width: '300px' }}
                        >
                          {__$$eval(
                            () => `目标分支：${this.state.detail?.data?.targetBranch?.name || '-'}`
                          )}
                        </Typography.Text>
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
                          {__$$eval(() => `描述：${this.state.detail?.data?.description || '-'}`)}
                        </Typography.Text>
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
                            () =>
                              `合并时删除源分支：${
                                this.state.detail?.data?.options?.delSourceBranch === 1
                                  ? '是'
                                  : '否'
                              }`
                          )}
                        </Typography.Text>
                        <Divider
                          __component_name="Divider"
                          dashed={false}
                          defaultOpen={false}
                          mode="default"
                          type="vertical"
                        />
                      </Space>
                    </Col>
                  </Row>
                </Col>
                <Col
                  __component_name="Col"
                  flex="200px"
                  style={{ alignItems: 'center', display: 'flex', justifyContent: 'flex-end' }}
                />
              </Row>
            </Col>
          </Row>
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
                    label: __$$eval(() => `Commits(${this.fullDiffData()?.commits?.length || 0})`),
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
                        maxHeight: 'calc(100vh - 519px)',
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
                              bordered={false}
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
                                      lineNumbers="on"
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
                                      theme="vs"
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
          <Space __component_name="Space" align="center" direction="horizontal">
            {!!__$$eval(() => this.state.detail?.data?.mergeRequestStatus === 'Openning') && (
              <Button
                __component_name="Button"
                block={false}
                danger={false}
                disabled={false}
                ghost={false}
                onClick={function () {
                  return this.confirmDoMerge.apply(
                    this,
                    Array.prototype.slice.call(arguments).concat([])
                  );
                }.bind(this)}
                shape="default"
                type="primary"
              >
                合并
              </Button>
            )}
            {!!__$$eval(
              () => !['Closed', 'Merged'].includes(this.state.detail?.data?.mergeRequestStatus)
            ) && (
              <Button
                __component_name="Button"
                block={false}
                danger={true}
                disabled={false}
                ghost={false}
                onClick={function () {
                  return this.confirmCloseMr.apply(
                    this,
                    Array.prototype.slice.call(arguments).concat([])
                  );
                }.bind(this)}
                shape="default"
              >
                关闭合并请求
              </Button>
            )}
            {!!__$$eval(() => this.state.detail?.data?.mergeRequestStatus === 'Conflicted') && (
              <Button
                __component_name="Button"
                block={false}
                danger={false}
                disabled={false}
                ghost={false}
                onClick={function () {
                  return this.confirmResolveConflict.apply(
                    this,
                    Array.prototype.slice.call(arguments).concat([])
                  );
                }.bind(this)}
                shape="default"
                style={{ marginTop: '8xpx', width: '80px' }}
                type="default"
              >
                解决冲突
              </Button>
            )}
          </Space>
        </Card>
      </Page>
    );
  }
}

const PageWrapper = (props = {}) => {
  const location = useLocation();
  const history = getUnifiedHistory();
  const match = matchPath({ path: '/apps/:appId/merge/:mergeId' }, location.pathname);
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
      ]}
      render={dataProps => (
        <AppDetailMergeDetail$$Page {...props} {...dataProps} self={self} appHelper={appHelper} />
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
