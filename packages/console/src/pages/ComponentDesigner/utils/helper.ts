import { project } from '@alilc/lowcode-engine';
import { IPublicEnumTransformStage } from '@alilc/lowcode-types';
import { initSdk } from '@tenx-ui/yunti-bff-client';
import { message } from 'antd';

import { DesignerProjectSchema, injectSchema } from '@/components/Designer';
import { getTreeById } from '@/utils';

interface SaveSchemaProps {
  success?: () => void;
  failed?: () => void;
}
export const saveSchema = async (props?: SaveSchemaProps) => {
  const { success, failed } = props || {};
  const schema = project.exportSchema(IPublicEnumTransformStage.Save);
  schema.componentsTree = schema.componentsTree.map((item: any) => {
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
  const id = schema.componentsTree[0].id;
  const sdk = initSdk({ tree: getTreeById(id) });
  try {
    await sdk.updateComponent({
      component: {
        id,
        schema,
      },
    });
    message.destroy();
    success ? success() : message.success('保存成功');
    project.currentDocument.history.savePoint();
  } catch (error) {
    message.destroy();
    failed ? failed() : message.warning('保存失败');
    console.warn('saveSchema failed', error);
  }
};

export const buildProjectSchema = (schema: DesignerProjectSchema) => {
  return injectSchema(schema);
};
