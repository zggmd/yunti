import { Button, Input, Overlay, Search } from '@alifd/next';
import { event, project, skeleton } from '@alilc/lowcode-engine';
import { IPublicModelEditor } from '@alilc/lowcode-types';
import { PlusOutlined } from '@ant-design/icons';
import { Empty, Tooltip, Typography } from 'antd';
import { debounce, set } from 'lodash';
import React from 'react';

import { handleTranslate } from '@/components/Designer/plugins/plugin-config-i18n/translate';
import { DesignerProjectSchema, PaneInjectProps } from '@/components/Designer/type';
import { uuid } from '@/utils';

import { PluginConfigI18n } from '../../plugins';
import './index.less';
import lang from './lang.json';

interface UpdateI18n {
  value: string;
  langKey: string;
  i18nKey: string;
  callback: (payload: { key: string; i18n: DesignerProjectSchema['i18n'] }) => void;
}
let timer;

// @Todo: 这个 setter 代码质量较差，交互也不合理，后面有时间建议参考宜搭的交互重新实现下
// 基于 https://github.com/alibaba/lowcode-engine-ext/blob/main/src/setter/i18n-setter/index.tsx 修改
interface I18nData {
  i18nData: string;
  langKey: string;
}
interface I18nPageData {
  i18nkey: string;
  i18nDataList: I18nData[];
}

interface I18nValue {
  type: 'i18n';
  key: string;
  i18nDataList: I18nData[];
  inputValue: string;
}
interface I18nPropsValue {
  type: string;
  key: string;
  [key: string]: I18nData | string;
}
interface I18nSetterProps {
  value: { key: string };
  onChange: (v: string | I18nPropsValue) => void;
  field: {
    editor: IPublicModelEditor;
  };
  placeholder: string;
  schema?: DesignerProjectSchema;
  onI18nSave: PaneInjectProps['onI18nSave'];
}

interface I18nSetterState {
  isShowSearchPopUp: boolean;
  isShowBindDataPopUp: boolean; // 数据绑定弹框
  i18nValue: I18nValue; // 输入值
  i18nSchema: DesignerProjectSchema['i18n']; // i8nSchema 对象
  i18nPageDataList: I18nPageData[]; // i8nSchema 数组
  i18nSearchDataList: I18nPageData[]; // 搜索 i8nSchema 数组
  searchValue: string; // 搜索值
  stringValue: string;
  createLoading: boolean;
  selectedI18nSearchData: I18nPageData;
}

class I18nSetter extends React.PureComponent<I18nSetterProps, I18nSetterState> {
  state: I18nSetterState = {
    isShowSearchPopUp: false,
    isShowBindDataPopUp: false,
    i18nValue: undefined,
    i18nSchema: undefined,
    i18nPageDataList: undefined,
    i18nSearchDataList: undefined,
    searchValue: undefined,
    stringValue: undefined,
    createLoading: false,
    selectedI18nSearchData: undefined,
  };
  SearchIconRef: any;
  InputRef: any;
  BindDataIconRef: any;
  componentDidMount() {
    this.init();
    event.on('common:updateI18nSetter', this.init);
    document.querySelector('#I18nSearch').addEventListener('keydown', this.keyDownEvent);
  }

  keyDownEvent = e => {
    const { selectedI18nSearchData, isShowSearchPopUp, searchValue, i18nSearchDataList } =
      this.state;
    if (!isShowSearchPopUp || !searchValue || !(i18nSearchDataList?.length > 0)) return;

    if (e.key === 'enter' || e.keyCode === 13) {
      if (selectedI18nSearchData) {
        this.onClickI18nItem(selectedI18nSearchData);
      }
      return;
    }

    const isDown = e.key === 'ArrowDown' || e.keyCode === 40;
    let index = isDown ? 0 : -1;
    if (selectedI18nSearchData) {
      const selectedIndex =
        i18nSearchDataList.findIndex(item => item.i18nkey === selectedI18nSearchData.i18nkey) || 0;
      index = isDown ? selectedIndex + 1 : selectedIndex - 1;
    }
    const selected = i18nSearchDataList.find((item, i) => i === index) || selectedI18nSearchData;
    this.setState({
      selectedI18nSearchData: selected,
    });

    const height = document.querySelector('#i18n-list').clientHeight;
    const stop = selected && document.getElementById(selected.i18nkey).offsetTop;
    const sHeight = selected && document.getElementById(selected.i18nkey).clientHeight;
    if (isDown && selected && height < stop + sHeight) {
      document.querySelector('#i18n-list').scrollTo({
        top: stop - (height - sHeight),
        behavior: 'smooth',
      });
    }
    if (!isDown && selected && height < stop) {
      document.querySelector('#i18n-list').scrollTo({
        top: stop,
        behavior: 'smooth',
      });
    }
  };

  init = (props?: any) => {
    // 初始化 schema 数据
    const { i18nPageDataList } = this.updateI18nPageDataList();
    // 初始化value
    const { value } = props || this.props;
    const i18nValue: I18nValue =
      value && value.key && this.setI18nValue(value.key, i18nPageDataList);
    const stringValue = typeof value === 'string' && value;
    this.setState({
      i18nValue,
      stringValue,
      searchValue: stringValue || i18nValue?.inputValue,
    });
  };

  componentWillUnmount() {
    event.off('common:updateI18nSetter', this.init);
    document.removeEventListener('I18nSearch', this.keyDownEvent);
  }

  // i8nSchema 数据格式转换 object => array
  transfromI18nData = (i18nSchema: DesignerProjectSchema['i18n']): I18nPageData[] => {
    const i18nPageDataList: I18nPageData[] = [];
    for (let langKey in i18nSchema) {
      const i18nMap = i18nSchema[langKey];
      for (let key2 in i18nMap) {
        let matchFlag = false;
        i18nPageDataList.length > 0 &&
          i18nPageDataList.forEach(i18nItem => {
            if (i18nItem.i18nkey === key2) {
              matchFlag = true;
              i18nItem.i18nDataList.push({
                langKey,
                i18nData: i18nMap[key2],
              });
            }
          });

        if (!matchFlag) {
          const i18nItem = {
            i18nkey: key2,
            i18nDataList: [],
          };
          i18nItem.i18nDataList.push({
            langKey,
            i18nData: i18nMap[key2],
          });

          //i18nItem.i18nData[langKey] = i18nMap[key2]
          i18nPageDataList.push(i18nItem);
        }
      }
    }
    return i18nPageDataList;
  };

  // 展示解除文案关联
  showBindDataPopUp = () => {
    this.setState({
      isShowBindDataPopUp: !this.state.isShowBindDataPopUp,
    });
  };

  // 解除文案管理操作
  clearI18n = () => {
    const { onChange } = this.props;
    this.setState({
      i18nValue: undefined,
      isShowBindDataPopUp: false,
      stringValue: this.state.i18nValue?.inputValue,
    });

    onChange(this.state.i18nValue?.inputValue || '');
  };

  // 根据 i18nkey 生成 i18nValue
  setI18nValue = (i18nkey: string, i18nPageDataList?: I18nPageData[]): I18nValue => {
    i18nPageDataList = i18nPageDataList || this.state.i18nPageDataList || [];
    let i18nDataList = [];
    for (const item of i18nPageDataList) {
      if (item.i18nkey === i18nkey) {
        i18nDataList = item.i18nDataList || [];
      }
    }
    let inputValue;
    // 中文用于input展示
    for (const item of i18nDataList) {
      if (item.langKey === 'zh-CN') {
        inputValue = item.i18nData;
      }
    }
    return {
      type: 'i18n',
      key: i18nkey,
      i18nDataList,
      inputValue,
    };
  };

  // 创建新的多语言文案
  createNewI18nItemData = async () => {
    const { stringValue, searchValue } = this.state;
    this.i18nItemOnChange({
      value: searchValue || stringValue,
      langKey: 'zh-CN',
      i18nKey: undefined,
    });
  };

  // i18nKey 唯一 id 生成
  uniqueId = (prefix = '') => {
    let guid = Date.now();
    return `${prefix}-${(guid++).toString(36).toLowerCase()}`;
  };

  focusI18nInput = () => {
    // const element = document.getElementById(`I18nInput0`);
    // element && element.focus();
  };
  // 绑定文案操作
  onClickI18nItem = (i18nItem: I18nPageData) => {
    const { onChange } = this.props;
    const i18nValue = this.setI18nValue(i18nItem.i18nkey);
    this.setState(
      {
        i18nValue,
        isShowBindDataPopUp: true,
        stringValue: undefined,
        searchValue: i18nValue?.inputValue,
      },
      this.focusI18nInput
    );
    onChange(this.parseI18nValue2PropsValue(i18nValue));
  };

  // 选中值 转换为 props 值
  parseI18nValue2PropsValue = (i18nValue: I18nValue): I18nPropsValue => {
    const propsValue = {
      type: 'i18n',
      key: i18nValue.key,
    };

    // @todo 会导致：修改后编辑区内容点击，还是原来的数据，页面 schema 需要同步修改保存
    // const { i18nDataList } = i18nValue;
    // i18nDataList.map(item => {
    //   propsValue[item.langKey] = item.i18nData;
    // });

    return propsValue;
  };
  // 搜索列表
  renderI18nList = () => {
    const { i18nSearchDataList, isShowBindDataPopUp, selectedI18nSearchData } = this.state;
    if (isShowBindDataPopUp || !this.state.searchValue) {
      return <></>;
    }
    return (
      <div className="lowcode-setter-i18n-list" id="i18n-list">
        {i18nSearchDataList?.length > 0 ? (
          i18nSearchDataList.map(item => {
            return (
              <div
                className={`lowcode-setter-i18n-search-box-container ${
                  selectedI18nSearchData?.i18nkey === item.i18nkey
                    ? 'lowcode-setter-i18n-search-box-container-selected'
                    : ''
                }`}
                id={item.i18nkey}
                key={item.i18nkey}
                onClick={() => this.onClickI18nItem(item)}
              >
                {item.i18nDataList &&
                  item.i18nDataList
                    ?.sort((a, b) => {
                      return b?.langKey?.localeCompare(a?.langKey);
                    })
                    .map(i18nItem => {
                      return (
                        <div className={`i18n-lang-item`} key={i18nItem.langKey}>
                          <div className="i18n-item-lang-type">
                            {lang[i18nItem.langKey].i18nLangCN}
                          </div>
                          <div className="item-lang-content">{i18nItem.i18nData}</div>
                        </div>
                      );
                    })}
              </div>
            );
          })
        ) : (
          <Empty className="lowcode-setter-i18n-list-empty" description={'回车创建多语言文案'} />
        )}
      </div>
    );
  };

  // 搜索
  onSearchChange = (value: string) => {
    const { i18nPageDataList } = this.state;
    const i18nSearchDataList: I18nPageData[] = [];

    i18nPageDataList.map(item => {
      if (
        item.i18nDataList.some(
          itemData =>
            value && value.trim() && itemData.i18nData.toLowerCase().includes(value.toLowerCase())
        )
      ) {
        i18nSearchDataList.push(item);
      }
    });

    if (!this.state.i18nValue?.inputValue) {
      this.props.onChange(value);
      this.setState({
        stringValue: value,
      });
    }
    this.setState({
      searchValue: value,
      i18nSearchDataList,
    });
  };

  updateI18n = debounce(async (payload: UpdateI18n) => {
    const { i18nKey = uuid('i18n'), langKey, value, callback } = payload;
    const { schema, onI18nSave } = this.props;
    let i18n = schema?.i18n || {};
    set(i18n, `['${langKey}']['${i18nKey}']`, value);

    // 获取英文
    let enUSValue;
    if (!payload.i18nKey) {
      const res = await handleTranslate({
        hasNotification: false,
        schema,
        values: [
          {
            i18nKey,
            zhCN: value,
          },
        ],
      });
      enUSValue = res?.[0]?.enUS || value;
      set(i18n, `['en-US']['${i18nKey}']`, enUSValue);
    }

    // 保存
    const newI18n = await onI18nSave(i18n);
    // 更新 form 表单
    event.emit('updatePluginConfigI18n', {
      i18nKey,
      langKey,
      enUSValue,
      value,
    });
    // 更新页面 schema
    project.setI18n(newI18n);

    callback &&
      callback({
        key: i18nKey,
        i18n,
      });
  }, 600);
  updateI18nSchema = payload => {
    this.updateI18n({
      ...payload,
      callback: res => {
        const { i18n, key } = res;
        const { i18nPageDataList } = this.updateI18nPageDataList(i18n);
        const i18nValue: I18nValue = this.setI18nValue(key, i18nPageDataList);
        const state = {
          isShowBindDataPopUp: true,
          createLoading: false,
          ...payload?.state,
        };
        if (!payload.i18nKey) {
          state.i18nValue = i18nValue;
          // 修改编辑区显示
          this.props.onChange(this.parseI18nValue2PropsValue(i18nValue));
        }
        this.setState(state, this.focusI18nInput);
      },
    });
  };
  // 修改中英文
  i18nItemOnChange = async (payload: {
    value: string;
    langKey: string;
    i18nKey: string;
    state?: any;
  }) => {
    if (payload.i18nKey) {
      const i18n = project.exportSchema()?.i18n;
      const { langKey, i18nKey, value } = payload || {};
      set(i18n, `[${langKey}][${i18nKey}]`, value);
      const { i18nPageDataList } = this.updateI18nPageDataList(i18n);
      const i18nValue: I18nValue = this.setI18nValue(i18nKey, i18nPageDataList);
      this.props.onChange(this.parseI18nValue2PropsValue(i18nValue));
      this.setState({
        i18nValue,
        searchValue: i18nValue.inputValue,
      });
    }
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(
      () => {
        this.setState(
          {
            createLoading: true,
          },
          () => {
            this.updateI18nSchema(payload);
          }
        );
      },
      payload.i18nKey ? 600 : 0
    );
  };

  // 打开多语言文案管理面板
  openI18nPane() {
    skeleton.showPanel(PluginConfigI18n.pluginName);
  }
  // 关闭多语言文案管理面板
  closeI18nPane() {
    skeleton.hidePanel(PluginConfigI18n.pluginName);
  }

  // 获取 i18n 数据
  updateI18nPageDataList = (
    i18n?: DesignerProjectSchema['i18n']
  ): {
    i18nPageDataList: I18nPageData[];
    i18nSchema: DesignerProjectSchema['i18n'];
  } => {
    const i18nSchema = i18n || project.exportSchema()?.i18n;
    const i18nPageDataList = this.transfromI18nData(i18nSchema);
    this.setState({
      i18nPageDataList,
      i18nSchema,
    });
    return {
      i18nPageDataList,
      i18nSchema,
    };
  };

  render() {
    const { i18nValue, isShowBindDataPopUp, stringValue, searchValue } = this.state;

    return (
      <div className="yunti-lowcode-setter-i18n">
        <div
          ref={ref => {
            this.InputRef = ref;
          }}
        >
          <Search
            id="I18nSearch"
            onBlur={() => {
              this.setState({
                isShowSearchPopUp: false,
              });
              this.setState({
                searchValue: stringValue || i18nValue?.inputValue,
              });
            }}
            onChange={v => {
              if (i18nValue?.inputValue) {
                this.i18nItemOnChange({
                  value: v,
                  langKey: 'zh-CN',
                  i18nKey: i18nValue.key,
                });
                return;
              }
              this.onSearchChange(v);
              this.setState({
                isShowSearchPopUp: true,
                selectedI18nSearchData: undefined,
              });
            }}
            onFocus={() => {
              if (i18nValue?.inputValue) {
                this.setState(
                  {
                    isShowBindDataPopUp: true,
                  },
                  this.focusI18nInput
                );
                return;
              }
              this.setState({
                isShowSearchPopUp: true,
                selectedI18nSearchData: undefined,
              });
              this.onSearchChange(stringValue || i18nValue?.inputValue);
              this.updateI18nPageDataList();
            }}
            onSearch={value => {
              const { i18nSearchDataList } = this.state;
              const item = i18nSearchDataList?.find(i => {
                return i.i18nDataList?.find(item => item.i18nData === value);
              });
              if (item) {
                this.onClickI18nItem(item);
              } else {
                this.state.searchValue && this.createNewI18nItemData();
              }
            }}
            placeholder="搜索已定义的文案"
            popupContent={this.renderI18nList()}
            shape="simple"
            style={{ width: '100%' }}
            type="normal"
            value={searchValue}
            visible={this.state.isShowSearchPopUp}
          />
        </div>
        {i18nValue?.key ? (
          <div
            className="i18n-icon i18n-icon-selected"
            onClick={this.showBindDataPopUp}
            ref={ref => {
              this.BindDataIconRef = ref;
            }}
          >
            <img src="https://gw.alicdn.com/imgextra/i3/O1CN01VpNCcg1wfTjbdHK8I_!!6000000006335-2-tps-200-200.png"></img>
          </div>
        ) : (
          <div
            className="i18n-icon i18n-icon-create"
            onClick={this.createNewI18nItemData}
            ref={ref => {
              this.SearchIconRef = ref;
            }}
          >
            <Tooltip title="创建多语言文案并绑定">
              <Button
                disabled={!this.state.searchValue}
                loading={this.state.createLoading}
                style={{ padding: '0 8px' }}
                type="primary"
              >
                {!this.state.createLoading && <PlusOutlined />}
              </Button>
            </Tooltip>
          </div>
        )}
        <Overlay
          canCloseByOutSideClick={true}
          offset={[-this.InputRef?.clientWidth + 26, 2]}
          onClose={() => {
            this.setState({
              isShowBindDataPopUp: false,
            });
          }}
          onRequestClose={() => {
            this.setState({
              isShowBindDataPopUp: false,
            });
          }}
          safeNode={() => this.InputRef}
          target={() => this.BindDataIconRef}
          v2
          visible={isShowBindDataPopUp}
        >
          <div className="binddata-popup-container" style={{ width: this.InputRef?.clientWidth }}>
            {i18nValue?.i18nDataList &&
              i18nValue?.i18nDataList
                ?.sort((a, b) => {
                  return b?.langKey?.localeCompare(a?.langKey);
                })
                ?.map((i18nItem, i) => {
                  return (
                    <div className="bind-item" key={i18nItem.langKey}>
                      <p>{lang[i18nItem.langKey].i18nLangCN}</p>
                      <Input
                        id={`I18nInput${i}`}
                        onChange={value =>
                          this.i18nItemOnChange({
                            value,
                            langKey: i18nItem.langKey,
                            i18nKey: i18nValue.key,
                          })
                        }
                        size="small"
                        value={i18nItem.i18nData}
                      />
                    </div>
                  );
                })}
            <Typography.Text type="secondary">
              {i18nValue?.i18nDataList && <div className="edit-i18n">注意：修改的是全局文案</div>}
            </Typography.Text>
            <div className="binddata-popup-container-footer">
              <Button className="open-i18n-button" onClick={this.openI18nPane} type="primary">
                多语言文案管理
              </Button>
              <Typography.Text
                className="binddata-popup-container-delete"
                onClick={this.clearI18n}
                type="danger"
              >
                解除文案关联
              </Typography.Text>
            </div>
          </div>
        </Overlay>
      </div>
    );
  }
}

export default I18nSetter;
