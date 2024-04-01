// 注意: 出码引擎注入的临时变量默认都以 "__$$" 开头，禁止在搭建的代码中直接访问。
// 例外：react 框架的导出名和各种组件名除外。
import { Alert, Component, Modal } from '@tenx-ui/materials';
import { getUnifiedHistory } from '@tenx-ui/utils/es/UnifiedLink/index.prod';
import React from 'react';
import { DataProvider } from 'shared-components';

import __$$constants from './__constants';
import * as __$$i18n from './i18n';
import './index.css';
import utils from './utils/__utils';

class Confirm$$Component extends React.Component {
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

    __$$i18n._inject2(this);

    this.state = { loading: false, visible: false };
  }

  $ = () => null;

  $$ = () => [];

  componentDidUpdate(prevProps, prevState) {
    if (this.props.data?.id && this.props.data?.id !== prevProps.data?.id) {
      this.setState({
        visible: true,
        loading: false,
      });
    }
  }

  componentWillUnmount() {}

  async onOk() {
    this.setState({
      loading: true,
    });
    const res = await this.props.data
      ?.onOk?.()
      ?.then(msg => {
        this.onCancel();
      })
      ?.catch(e => {
        this.setState({
          loading: false,
        });
        console.warn('confirm: onOk error:', e);
        throw e;
      });
  }

  onCancel() {
    this.setState({
      visible: false,
      loading: false,
    });
  }

  componentDidMount() {
    if (this.props.data?.id) {
      this.setState({
        visible: true,
        loading: false,
      });
    }
  }

  render() {
    const __$$context = this._context || this;
    const { state } = __$$context;
    return (
      <Component>
        {!!__$$eval(() => this.state.visible) && (
          <Modal
            __component_name="Modal"
            centered={false}
            confirmLoading={__$$eval(() => this.state.loading)}
            destroyOnClose={true}
            forceRender={false}
            keyboard={true}
            mask={true}
            maskClosable={false}
            onCancel={function () {
              return Reflect.apply(this.onCancel, this, [...Array.prototype.slice.call(arguments)]);
            }.bind(this)}
            onOk={function () {
              return Reflect.apply(this.onOk, this, [...Array.prototype.slice.call(arguments)]);
            }.bind(this)}
            open={true}
            title={__$$eval(() => this.props.data?.title || '确认')}
          >
            <Alert
              __component_name="Alert"
              message={__$$eval(() => this.props.data?.content || '请确认')}
              showIcon={true}
              type={__$$eval(() => this.props.data?.type || 'warning')}
            />
          </Modal>
        )}
      </Component>
    );
  }
}

const ComponentWrapper = React.forwardRef((props = {}, ref) => {
  const history = getUnifiedHistory();
  const appHelper = {
    utils,
    constants: __$$constants,
    history,
  };
  const self = {
    appHelper,
    ...appHelper,
  };
  return (
    <DataProvider
      render={dataProps => (
        <Confirm$$Component ref={ref} {...props} {...dataProps} appHelper={appHelper} self={self} />
      )}
      sdkInitFunc={{
        enabled: undefined,
        params: undefined,
      }}
      sdkSwrFuncs={[]}
      self={self}
    />
  );
});
export default ComponentWrapper;

function __$$eval(expr) {
  try {
    return expr();
  } catch {}
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
