import { registerEnumType } from '@nestjs/graphql';

export enum PublishStatus {
  /** 发布中 */
  Running = 'Running',
  /** 发布成功 */
  Done = 'Done',
  /** 发布失败 */
  Failed = 'Failed',
}

registerEnumType(PublishStatus, {
  name: 'PublishStatus',
  description: '发布状态',
  valuesMap: {
    Running: {
      description: '发布中',
    },
    Done: {
      description: '发布成功',
    },
    Failed: {
      description: '发布失败',
    },
  },
});
