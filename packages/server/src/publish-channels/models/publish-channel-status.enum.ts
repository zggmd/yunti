import { registerEnumType } from '@nestjs/graphql';

export enum PublishChannelStatus {
  /** 健康 */
  Healthy = 'Healthy',
  /** 异常 */
  Abnormal = 'Abnormal',
}

registerEnumType(PublishChannelStatus, {
  name: 'PublishChannelStatus',
  description: '发布渠道',
  valuesMap: {
    Healthy: {
      description: '健康',
    },
    Abnormal: {
      description: '异常',
    },
  },
});
