import { registerEnumType } from '@nestjs/graphql';

export enum MergeRequestStatus {
  /** 创建 */
  Openning = 'Openning',
  /** 已合并 */
  Merged = 'Merged',
  /** 已关闭 */
  Closed = 'Closed',
  /** Draft */
  Draft = 'Draft',
  /** 有冲突 */
  Conflicted = 'Conflicted',
}

registerEnumType(MergeRequestStatus, {
  name: 'MergeRequestStatus',
  description: '合并请求状态',
  valuesMap: {
    Openning: {
      description: 'Openning',
    },
    Merged: {
      description: 'Merged',
    },
    Closed: {
      description: 'Closed',
    },
    Draft: {
      description: 'Draft',
    },
    Conflicted: {
      description: 'Conflicted',
    },
  },
});
