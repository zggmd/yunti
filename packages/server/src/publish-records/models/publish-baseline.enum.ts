import { registerEnumType } from '@nestjs/graphql';

export enum PublishBaseline {
  /** 分支 */
  Branch = 'Branch',
  /** 标签 */
  Tag = 'Tag',
  /** 提交 ID */
  CommitId = 'CommitId',
}

registerEnumType(PublishBaseline, {
  name: 'PublishBaseline',
  description: '发布基线',
  valuesMap: {
    Branch: {
      description: '分支',
    },
    Tag: {
      description: '标签',
    },
    CommitId: {
      description: '提交 ID',
    },
  },
});
