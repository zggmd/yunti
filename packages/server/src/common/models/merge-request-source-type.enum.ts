import { registerEnumType } from '@nestjs/graphql';

export enum MergeRequestSourceType {
  /** app 代码 */
  app = 'app',
  /** component 代码 */
  component = 'component',
}

registerEnumType(MergeRequestSourceType, {
  name: 'MergeRequestSourceType',
  description: '合并代码来源',
  valuesMap: {
    app: {
      description: 'app 代码',
    },
    component: {
      description: 'component 代码',
    },
  },
});
