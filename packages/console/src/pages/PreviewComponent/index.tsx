import { useSdk } from '@tenx-ui/yunti-bff-client';
import { useLocation } from '@umijs/max';
import { Empty } from 'antd';
import qs from 'query-string';
import React, { useMemo } from 'react';

import { getTreeById } from '@/utils';

import Preview from '../../components/Designer/components/Preview';
import { buildProjectSchema } from '../ComponentDesigner/utils';

const PreviewComponent: React.FC = () => {
  const location = useLocation();
  const query = useMemo(() => qs.parse(location.search), [location.search]);
  const componentId = query.componentId as string;
  const tree = (query.tree || getTreeById(componentId)) as string;
  const sdk = useSdk({ tree });
  const { data: componentData, mutate, loading } = sdk.useGetComponent({ id: componentId, tree });

  const projectSchema = useMemo(
    () => buildProjectSchema(componentData?.component?.schema),
    [componentData?.component?.schema]
  );

  if (!componentId || (loading === false && !componentData.component)) {
    return <Empty className="empty" description={<span>组件 {componentId} 不存在</span>} />;
  }

  return (
    <Preview
      assets={componentData?.component?.assets}
      refresh={mutate}
      rendererName="LowCodeRenderer"
      schema={projectSchema}
    />
  );
};

export default PreviewComponent;
