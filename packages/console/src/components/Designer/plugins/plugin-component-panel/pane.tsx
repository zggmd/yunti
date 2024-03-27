import { Loading, Search } from '@alifd/next';
import Category from '@alilc/lowcode-plugin-components-pane/es/components/Category';
import Component from '@alilc/lowcode-plugin-components-pane/es/components/Component';
import List from '@alilc/lowcode-plugin-components-pane/es/components/List';
import Tab from '@alilc/lowcode-plugin-components-pane/es/components/Tab';
import style from '@alilc/lowcode-plugin-components-pane/es/index.module.scss';
import ComponentManager from '@alilc/lowcode-plugin-components-pane/es/store';
import transform, {
  SnippetMeta,
  SortedGroups,
  StandardComponentMeta,
  Text,
  createI18n,
  getTextReader,
} from '@alilc/lowcode-plugin-components-pane/es/utils/transform';
import { PluginProps } from '@alilc/lowcode-types';
import cls from 'classnames/bind';
import { debounce } from 'lodash';
import React from 'react';

let timer;
const { material, common, project, event } = window.AliLowCodeEngine || {};

const isNewEngineVersion = !!material;

const store = new ComponentManager();

const cx = cls.bind(style);

interface ComponentPaneProps extends PluginProps {
  [key: string]: any;
}

interface ComponentPaneState {
  groups: SortedGroups[];
  filter: SortedGroups[];
  keyword: string;
}

export default class ComponentPane extends React.Component<ComponentPaneProps, ComponentPaneState> {
  static displayName = 'LowcodeComponentPane';

  static defaultProps = {
    lang: 'zh_CN',
  };

  state: ComponentPaneState = {
    groups: [],
    filter: [],
    keyword: '',
  };

  store = store;

  t: (input: Text) => string;

  getStrKeywords: (keywords: Text[]) => string;

  getKeyToSearch(c: StandardComponentMeta | SnippetMeta) {
    const strTitle = this.t(c.title);
    const strComponentName = this.t((c as SnippetMeta).schema?.componentName);
    const strDescription = 'description' in c ? this.t(c.description) : '';
    const strKeywords = 'keywords' in c ? this.getStrKeywords(c.keywords || []) : '';
    return `${strTitle}#${strComponentName}#${strDescription}#${strKeywords}`.toLowerCase();
  }

  getFilteredComponents = debounce(() => {
    const { groups = [], keyword } = this.state;
    if (!keyword) {
      this.setState({
        filter: groups,
      });
      return;
    }

    const filter = groups.map(group => ({
      ...group,
      categories: group.categories
        .map(category => ({
          ...category,
          components: category.components.filter(c => {
            let keyToSearch = this.getKeyToSearch(c);
            if (c.snippets) {
              c.snippets.map(item => {
                keyToSearch += `_${this.getKeyToSearch(item)}`;
              });
            }
            return keyToSearch.includes(keyword);
          }),
        }))
        .filter(c => c?.components?.length),
    }));

    this.setState({
      filter,
    });
  }, 200);

  constructor(props) {
    super(props);
    this.t = getTextReader(props.lang);
    this.getStrKeywords = (keywords: Text[]): string => {
      if (typeof keywords === 'string') {
        return keywords;
      }
      if (keywords && Array.isArray(keywords) && keywords.length > 0) {
        return keywords.map(keyword => this.t(keyword)).join('-');
      }
      return '';
    };
  }

  componentDidMount() {
    // this.loadLcc();
    const { editor } = this.props;
    if (!editor) {
      this.initComponentList();
      return;
    }
    const assets = isNewEngineVersion ? material.getAssets() : editor.get('assets');
    if (assets) {
      this.initComponentList();
    } else {
      console.warn('[ComponentsPane]: assets not ready, wait for assets ready event.');
    }

    if (isNewEngineVersion) {
      event.on('trunk.change', this.initComponentList.bind(this));
      material.onChangeAssets(this.initComponentList.bind(this));
    } else {
      editor.on('trunk.change', this.initComponentList.bind(this));
      editor.once('editor.ready', this.initComponentList.bind(this));
      editor.on('designer.incrementalAssetsReady', this.initComponentList.bind(this));
    }
  }

  /**
   * 初始化组件列表
   * TODO: 无副作用，可多次执行
   */
  initComponentList() {
    const { editor } = this.props;
    const rawData = isNewEngineVersion ? material.getAssets() : editor.get('assets');

    const meta = transform(rawData, this.t);

    const { groups, snippets } = meta;
    this.store.setSnippets(snippets);

    this.setState({
      groups,
      filter: groups,
    });
  }

  registerAdditive = (shell: HTMLDivElement | null) => {
    if (!shell || shell.dataset.registered) {
      return;
    }

    function getSnippetId(elem: any) {
      if (!elem) {
        return null;
      }
      while (shell !== elem) {
        if (elem.classList.contains('snippet')) {
          return elem.dataset.id;
        }
        elem = elem.parentNode;
      }
      return null;
    }

    const { editor } = this.props;
    const designer = isNewEngineVersion ? null : editor?.get('designer');
    const _dragon = isNewEngineVersion ? common.designerCabin.dragon : designer?.dragon;
    if (!_dragon || (!isNewEngineVersion && !designer)) {
      return;
    }

    const click = (e: Event) => {};

    shell.addEventListener('click', click);

    _dragon.from(shell, (e: Event) => {
      const doc = isNewEngineVersion ? project.getCurrentDocument() : designer?.currentDocument;
      const id = getSnippetId(e.target);
      if (!doc || !id) {
        return false;
      }

      const dragTarget = {
        type: 'nodedata',
        data: this.store.getSnippetById(id),
      };

      return dragTarget;
    });

    shell.dataset.registered = 'true';
  };

  handleSearch = (keyword = '') => {
    this.setState({
      keyword: keyword.toLowerCase(),
    });
    this.getFilteredComponents();
  };

  renderEmptyContent() {
    return (
      <div className={cx('empty')}>
        <img src="//g.alicdn.com/uxcore/pic/empty.png" />
        <div className={cx('content')}>
          {this.t(createI18n('暂无组件，请在物料站点添加', 'No components, please add materials'))}
        </div>
      </div>
    );
  }
  renderContent() {
    const { filter = [], keyword } = this.state;
    const hasContent = filter.filter(item => {
      return item?.categories?.filter(category => {
        return category?.components?.length;
      }).length;
    }).length;
    if (!hasContent) {
      return this.renderEmptyContent();
    }
    if (keyword) {
      return (
        <div className={cx('filtered-content')} ref={this.registerAdditive}>
          {filter.map(group => {
            const { categories } = group;
            return categories.map(category => {
              const { components } = category;
              const cname = this.t(category.name);
              return (
                <Category key={cname} name={cname}>
                  <List>
                    {components.map(component => {
                      const { componentName, snippets = [] } = component;
                      return snippets
                        .filter(
                          snippet =>
                            snippet.id &&
                            this.getKeyToSearch(snippet).toLowerCase().includes(keyword)
                        )
                        .map(snippet => {
                          return (
                            <Component
                              data={{
                                title: snippet.title || component.title,
                                icon: snippet.screenshot || component.icon,
                                snippets: [snippet],
                              }}
                              key={`${this.t(group.name)}_${this.t(componentName)}_${this.t(
                                snippet.title
                              )}`}
                              t={this.t}
                            />
                          );
                        });
                    })}
                  </List>
                </Category>
              );
            });
          })}
        </div>
      );
    }
    return (
      <Tab
        className={cx('tabs')}
        ref={ref => {
          const handleSelect = ref?.handleSelect;
          if (!ref) return;
          ref.handleSelect = active => {
            handleSelect(active);
            const length = filter?.[active]?.categories?.map(item => item.components?.length) || [];
            const maxLength = Math.max(...length);
            this.setState({
              activeGroupId: active,
              length: maxLength < 100 ? maxLength : 100,
              loading: true,
            });
            const refresh = () => {
              if (timer) {
                clearTimeout(timer);
              }
              timer = setTimeout(() => {
                this.setState({
                  length: maxLength,
                });
                if (this.state.length + 100 < maxLength) {
                  refresh();
                } else {
                  this.setState({
                    loading: false,
                  });
                }
              }, 200);
            };
            refresh();
          };
        }}
      >
        {filter.map((group, i) => {
          const { categories } = group;
          const activeGroupId = this.state.activeGroupId || 0;
          if (this.state.loading) {
            return (
              <Tab.Item key={this.t(group.name)} title={this.t(group.name)}>
                <Loading
                  style={{ marginTop: '150px', display: 'flex' }}
                  tip="加载中..."
                  visible={true}
                ></Loading>
              </Tab.Item>
            );
          }
          return (
            <Tab.Item key={this.t(group.name)} title={this.t(group.name)}>
              <div ref={this.registerAdditive}>
                {categories.map(category => {
                  const { components } = category;
                  const cname = this.t(category.name);
                  if (i !== activeGroupId) return;
                  return (
                    <Category key={cname} name={cname}>
                      <List>
                        {components?.slice(0, this.state.length).map(component => {
                          const { componentName, snippets = [] } = component;
                          return snippets
                            .filter(snippet => snippet.id)
                            .map(snippet => {
                              return (
                                <Component
                                  data={{
                                    title: snippet.title || component.title,
                                    icon: snippet.screenshot || component.icon,
                                    snippets: [snippet],
                                  }}
                                  key={`${this.t(group.name)}_${this.t(componentName)}_${this.t(
                                    snippet.title
                                  )}`}
                                  t={this.t}
                                />
                              );
                            });
                        })}
                      </List>
                    </Category>
                  );
                })}
              </div>
            </Tab.Item>
          );
        })}
      </Tab>
    );
  }

  render() {
    return (
      <div className={cx('lowcode-component-panel')}>
        <div className={cx('header')}>
          <Search
            autoFocus
            className={cx('search')}
            hasClear
            onChange={this.handleSearch}
            onSearch={this.handleSearch}
            placeholder={this.t(createI18n('搜索组件', 'Search components'))}
            shape="simple"
          />
        </div>
        {this.renderContent()}
      </div>
    );
  }
}

export { default as PaneIcon } from '@alilc/lowcode-plugin-components-pane/es/Icon';
