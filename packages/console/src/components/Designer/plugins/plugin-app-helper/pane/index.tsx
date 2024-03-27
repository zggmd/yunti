import { project, skeleton } from '@alilc/lowcode-engine';
import { IPublicEnumTransformStage } from '@alilc/lowcode-types';
import { Tabs } from 'antd';
import React, { useEffect, useState } from 'react';

import { PaneInjectProps } from '@/components/Designer/type';

import { pluginName } from '../helper';
import ConstantsPane from './constants';
import './index.less';
import UtilsPane from './utils';

const AppHelperPane: React.FC<PaneInjectProps> = props => {
  const { assets, onSchemaSave } = props;
  const [schema, setSchema] = useState(props.schema);
  const onSave = async (newSchema: object) => {
    const __schema = await onSchemaSave(newSchema);
    const projectSchema = project.exportSchema(IPublicEnumTransformStage.Save);
    project.importSchema({
      ...__schema,
      componentsTree: projectSchema.componentsTree,
      componentsMap: projectSchema.componentsMap,
    } as any);
    setSchema(__schema as any);
    return __schema;
  };

  useEffect(() => {
    skeleton.onShowPanel((name: string) => {
      if (name === pluginName) {
        const projectSchema = project.exportSchema(IPublicEnumTransformStage.Save);
        delete projectSchema.componentsTree;
        delete projectSchema.componentsMap;
        setSchema(projectSchema as any);
      }
    });
  }, []);

  return (
    <Tabs
      className="plugin-app-helper"
      items={[
        {
          label: 'constants',
          key: 'constants',
          children: (
            <ConstantsPane
              constants={schema?.constants}
              onSave={constants => onSave({ constants })}
            />
          ),
        },
        {
          label: 'utils',
          key: 'utils',
          children: (
            <UtilsPane
              onSave={utils => onSave({ utils })}
              packages={assets?.packages}
              utils={schema?.utils}
            />
          ),
        },
      ]}
      type="card"
    />
  );
};

export default AppHelperPane;
