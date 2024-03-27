import { common, config, project } from '@alilc/lowcode-engine';
import { schema2JsCode } from '@alilc/lowcode-plugin-code-editor/es/utils';

export const checkBlockAPI = (names?: string[]) => {
  const apiList = config.get('apiList') || {};
  const { block: blockAPI } = apiList;
  const noApis = names?.filter(name => !blockAPI?.[name]) || [];
  if (noApis.length > 0) {
    throw new Error(`[BlockPane] block ${noApis?.join(', ')} api required in engine config.`);
  }

  return blockAPI;
};

export const CATEGORY_MAP = [
  { name: '全部', id: 'ALL' },
  { name: '布局', id: 'LAYOUT' },
  { name: '列表', id: 'LIST' },
  { name: '详情', id: 'DETAIL' },
  { name: '弹框', id: 'MODAL' },
  { name: '表单', id: 'FORM' },
  { name: '图表', id: 'CHART' },
  { name: '其他', id: 'OTHER' },
];

export interface Block {
  id: string;
  name: string;
  title: string;
  schema: string;
  screenshot: string;
  created_at?: string;
  updated_at?: string;
  packages?: any;
  jsCode?: string;
  category?: string;
  creator?: {
    id: string;
    name: string;
  };
}

export const getJsCode = () => {
  const schema = project.exportSchema(common.designerCabin.TransformStage.Save);
  const jsCode = schema2JsCode(schema);
  return jsCode;
};

export const getBlockName = block => {
  // @todo 国际化
  return block?.title || '-';
};
