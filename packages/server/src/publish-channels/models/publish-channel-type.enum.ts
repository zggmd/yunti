import { registerEnumType } from '@nestjs/graphql';

export enum PublishChannelType {
  /** helm 仓库 */
  Helm = 'Helm',
  /** github 仓库 */
  Github = 'Github',
  /** gitlab 仓库 */
  Gitlab = 'Gitlab',
}

registerEnumType(PublishChannelType, {
  name: 'PublishChannelType',
  description: '发布渠道',
  valuesMap: {
    Helm: {
      description: 'helm 仓库',
    },
    Github: {
      description: 'github 仓库',
    },
    Gitlab: {
      description: 'gitlab 仓库',
    },
  },
});
