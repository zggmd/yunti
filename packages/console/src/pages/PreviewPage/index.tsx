import { useSdk } from '@tenx-ui/yunti-bff-client';
import { useLocation } from '@umijs/max';
import { Empty } from 'antd';
import qs from 'query-string';
import React, { useMemo } from 'react';

import { getTreeById } from '@/utils';

import Preview from '../../components/Designer/components/Preview';
import { buildProjectSchemaFromAppAndPage } from '../PageDesigner/utils';

const PreviewPage: React.FC = () => {
  const location = useLocation();
  const query = useMemo(() => qs.parse(location.search), [location.search]);
  const appId = query.appId as string;
  const pageId = query.pageId as string;
  const tree = (query.tree || getTreeById(appId)) as string;
  const sdk = useSdk({ tree });
  const { data: appData, mutate, loading: appLoading } = sdk.useGetApp({ id: appId, tree });
  const { data: pageData, loading: pageLoading } = sdk.useGetPage({ id: pageId });
  const projectSchema = useMemo(
    () => buildProjectSchemaFromAppAndPage(appData?.app, pageData?.page),
    [appData?.app, pageData?.page]
  );
  if (!appId || !pageId) {
    return <Empty className="empty" description={<span>暂无可用预览</span>} />;
  }
  if (appLoading === false && !appData.app) {
    return <Empty className="empty" description={<span>应用 {appId} 不存在</span>} />;
  }
  if (pageLoading === false && !pageData.page) {
    return <Empty className="empty" description={<span>页面 {pageId} 不存在</span>} />;
  }
  return (
    <Preview
      appId={appId}
      assets={appData?.app?.assets}
      pages={appData?.app?.pages}
      refresh={mutate}
      schema={projectSchema}
    />
  );
};

export default PreviewPage;
