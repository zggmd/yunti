import { ObjectType, createUnionType } from '@nestjs/graphql';

import { PublishChannelHelm } from '@/publish-channels-helm/models/publish-channel-helm.model';

@ObjectType({ description: 'github 仓库详情' })
export class PublishChannelGithub {
  /** 令牌 */
  token: string;
}

export const PublishChannelDetail = createUnionType({
  name: 'PublishChannelDetail',
  types: () => [PublishChannelHelm, PublishChannelGithub] as const,
  // 注意定义联合类型时，最好加上这个字段，否则需要返回类的实例而不是 json 数据
  resolveType(value) {
    if (value.token) {
      return PublishChannelGithub;
    }
    return PublishChannelHelm;
  },
  description: '发布渠道详情',
});
