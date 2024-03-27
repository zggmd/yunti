import { project } from '@alilc/lowcode-engine';
import { IPublicEnumTransformStage } from '@alilc/lowcode-types';
import { GetAppQuery, GetPageQuery, initSdk } from '@tenx-ui/yunti-bff-client';
import { matchPath } from '@umijs/max';
import cloneDeep from 'lodash/cloneDeep';

import { DesignerProjectSchema, injectSchema } from '@/components/Designer';
import { message } from '@/layouts';
import { getTreeById } from '@/utils';

export const saveSchema = async () => {
  const { appId, pageId } =
    matchPath({ path: '/design/apps/:appId/pages/:pageId' }, window.location.pathname)?.params ||
    {};
  const content = project.exportSchema(IPublicEnumTransformStage.Save);
  // eslint-disable-next-line no-console
  console.log('content', content);
  content.componentsTree = content.componentsTree.map((item: any) => {
    if (item._page_editor_props) {
      delete item._page_editor_props;
    }
    if (item.__page) {
      delete item.__page;
    }
    // 移除预览时添加的临时属性
    if (item.meta?.appConfig) {
      delete item.meta.appConfig;
    }
    return item;
  });
  // 页面只保存这 3 项，其他保存在应用 schema 中
  const { componentsMap, componentsTree, version } = content;
  const sdk = initSdk({ tree: getTreeById(appId) });
  try {
    await sdk.updatePage({
      page: {
        id: pageId,
        content: { componentsMap, componentsTree, version },
      },
    });
    message.success('保存成功');
  } catch (error) {
    message.warning('保存失败');
    console.warn('saveSchema failed', error);
  }
};

export const buildProjectSchemaFromAppAndPage = (
  app: GetAppQuery['app'],
  page: GetPageQuery['page']
) => {
  if (!app || !page) {
    return;
  }
  const schema: DesignerProjectSchema = cloneDeep(app?.schema || {});
  schema.componentsTree = cloneDeep(page?.content?.componentsTree);
  schema.componentsMap = cloneDeep(page?.content?.componentsMap);
  if (schema.componentsTree?.[0]?.componentName === 'Page') {
    injectSchema(schema);
  }
  return schema;
};
