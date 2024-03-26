import { IPublicTypePageSchema } from '@alilc/lowcode-types';

import { DesignerProjectSchema } from '@/types';

interface I18nMatch {
  path: string[];
  range?: {
    start: any;
    end: any;
  };
  text: string;
  isString: boolean;
}

export const findI18n = <T = IPublicTypePageSchema>(schema: DesignerProjectSchema<T>) => {
  for (const container of schema.componentsTree) {
    //
  }
};
