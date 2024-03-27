import { material } from '@alilc/lowcode-engine';
import {
  IPublicTypeFieldConfig as FieldConfig,
  IPublicTypeComponentMetadata,
} from '@alilc/lowcode-types';

function addonCombine(metadata: IPublicTypeComponentMetadata) {
  const { componentName, configure = {} } = metadata;

  const isRoot: boolean = componentName === 'Page' || componentName === 'Component';

  if (isRoot) {
    return metadata;
  }

  let advancedGroup: FieldConfig | undefined;

  const refItem: FieldConfig = {
    title: {
      label: 'refId',
      tip: (
        <div>
          用于获取组件实例，调用物料内部方法。
          <br />
          用例1，获取全部实例：this.$()
          <br />
          用例2，获取 refId 为 abc 的实例：this.$('abc')
        </div>
      ),
      icon: '',
    },
    name: 'ref',
    setter: [
      {
        componentName: 'StringSetter',
      },
      {
        componentName: 'ExpressionSetter',
      },
      {
        componentName: 'VariableSetter',
      },
    ],
    extraProps: {
      display: 'block',
      supportVariable: false,
    },
  };

  if (!configure.combined) {
    configure.combined = [];
  }

  advancedGroup = configure.combined?.filter(d => d.name === '#advanced')[0];

  if (!advancedGroup) {
    advancedGroup = {
      name: '#advanced',
      title: { 'type': 'i18n', 'zh-CN': '高级', 'en-US': 'Advanced' },
      items: [refItem],
    };

    configure.combined.push(advancedGroup);
  }

  if (!advancedGroup.items) {
    advancedGroup.items = [refItem];
  }

  const advanceItems: FieldConfig[] = advancedGroup.items || [];

  if (
    !advanceItems ||
    advanceItems.length === 0 ||
    !advanceItems?.filter(d => d.name === 'ref').length
  ) {
    advanceItems.push(refItem);
  }

  return {
    ...metadata,
    configure,
  };
}

const SetRefPropPlugin = () => {
  return {
    async init() {
      material.registerMetadataTransducer(addonCombine, 110, 'register-ref-prop');
    },
  };
};

SetRefPropPlugin.pluginName = 'SetRefPropPlugin';
export default SetRefPropPlugin;
