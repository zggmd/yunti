import { injectComponents } from '@alilc/lowcode-plugin-inject';
import { IPublicTypeAssetsJson, IPublicTypeRootSchema } from '@alilc/lowcode-types';
import ProCard from '@ant-design/pro-card';
import { GetAppQuery } from '@tenx-ui/yunti-bff-client';
import { Alert, Spin, theme as antdTheme } from 'antd';
import { set } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { DesignerProjectSchema } from '@/components/Designer';

import ThemeSwitcher from '../../../ThemeSwitcher';
import { LibraryMap, parseAssets } from './parse-assets';
import Renderer from './renderer';

export interface PreviewProps {
  schema: DesignerProjectSchema;
  assets: IPublicTypeAssetsJson;
  /** 渲染类型，标识当前模块是以什么类型进行渲染的 */
  rendererName?: 'LowCodeRenderer' | 'PageRenderer' | string;
  pages?: GetAppQuery['app']['pages'];
  appId?: string;
  refresh?: () => void;
}

const Preview: React.FC<PreviewProps> = (props: PreviewProps) => {
  const { schema: projectSchema, assets, rendererName = 'PageRenderer', pages, appId } = props;
  const [components, setComponents] = useState({});
  const [libraryMap, setLibraryMap] = useState<LibraryMap>({});
  const [schema, setSchema] = useState<IPublicTypeRootSchema>();
  const [loading, setLoading] = useState(true);
  const [algorithmTypes, setAlgorithmTypes] = useState([]);

  const handleThemeChange = useCallback(
    async (value, types, initSchema?) => {
      setLoading(true);
      setTimeout(() => {
        // 仅用于预览，实际 schema 中不能保存函数
        set(schema || initSchema, 'meta.appConfig.antd.configProvider.theme.algorithm', value);
        setSchema(schema || initSchema);
        setAlgorithmTypes(types);
        setLoading(false);
      }, 200);
    },
    [schema]
  );

  const algorithm = useMemo(() => algorithmTypes?.map(key => antdTheme[key]), [algorithmTypes]);

  async function init() {
    const { componentsMap: componentsMapArray } = projectSchema;
    if (!componentsMapArray) {
      setSchema();
      setLoading(false);
      return;
    }

    const res = await parseAssets(assets);
    const newComponents = await injectComponents(res.components);
    const initSchema = projectSchema.componentsTree[0];
    setSchema(initSchema);
    setComponents(newComponents);
    setLibraryMap(res.libraryMap);
    setLoading(false);

    const types = projectSchema?.config?.theme?.themeAlgorithm || ['defaultAlgorithm'];
    const value = types?.map(key => antdTheme[key]);
    setAlgorithmTypes(types);
    handleThemeChange(value, types, initSchema);
  }

  useEffect(() => {
    setLoading(true);
    if (!projectSchema || !assets) {
      return;
    }
    // @Todo: 这块儿是否还能优化，需要再看看
    init();
  }, [projectSchema, assets]);

  if (loading) {
    return (
      <ProCard layout="center" style={{ height: 360 }}>
        <Spin size="large" />
      </ProCard>
    );
  }

  return (
    <div style={{ background: algorithm?.includes(antdTheme.darkAlgorithm) ? '#212121' : 'none' }}>
      <Alert.ErrorBoundary>
        <ThemeSwitcher onChange={handleThemeChange} value={algorithm} />
        <Renderer
          appId={appId}
          components={components}
          libraryMap={libraryMap}
          pages={pages}
          projectSchema={projectSchema}
          rendererName={rendererName}
          schema={schema}
        />
      </Alert.ErrorBoundary>
    </div>
  );
};

export default Preview;
