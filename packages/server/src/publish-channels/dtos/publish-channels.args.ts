import { Field, InputType } from '@nestjs/graphql';

import { OrderBy } from '@/common/models/order-by.enum';

import { PublishChannelStatus } from '../models/publish-channel-status.enum';
import { PublishChannelType } from '../models/publish-channel-type.enum';

@InputType({ description: '获取发布渠道的筛选参数' })
export class PublishChannelsFilterArgs {
  /** 模糊匹配仓库名称 */
  q?: string;
  /** 渠道状态 */
  @Field(() => PublishChannelStatus, {
    description: '渠道状态',
    nullable: true,
  })
  status?: PublishChannelStatus;
  /** 渠道类型 */
  @Field(() => PublishChannelType, {
    description: '渠道类型',
    nullable: true,
  })
  type?: PublishChannelType;
}

@InputType({ description: '获取发布渠道的排序参数' })
export class PublishChannelsOrderArgs {
  /** 更新时间 */
  @Field(() => OrderBy, {
    description: '更新时间',
    nullable: true,
  })
  updateAt?: OrderBy;
  /** 创建时间 */
  @Field(() => OrderBy, {
    description: '创建时间',
    nullable: true,
  })
  createAt?: OrderBy;
}

@InputType({ description: '获取发布渠道的参数' })
export class PublishChannelsArgs {
  /** 筛选参数 */
  @Field(() => PublishChannelsFilterArgs, {
    description: '筛选参数',
    nullable: true,
  })
  filter?: PublishChannelsFilterArgs;
  /** 排序参数 */
  @Field(() => PublishChannelsOrderArgs, {
    description: '排序参数',
    nullable: true,
  })
  order?: PublishChannelsOrderArgs;
}
