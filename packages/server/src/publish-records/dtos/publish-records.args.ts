import { Field, InputType } from '@nestjs/graphql';

import { OrderBy } from '@/common/models/order-by.enum';
import { PaginationArgs } from '@/common/models/pagination.args';

import { PublishBaseline } from '../models/publish-baseline.enum';
import { PublishStatus } from '../models/publish-status.enum';

@InputType({ description: '获取发布记录的筛选参数' })
export class PublishRecordsFilterArgs {
  /** 模糊匹配仓库名称、版本 */
  q?: string;
  /** 发布状态 */
  @Field(() => PublishStatus, {
    description: '发布状态',
    nullable: true,
  })
  status?: PublishStatus;
  /** 发布基线 */
  @Field(() => PublishBaseline, {
    description: '发布基线',
    nullable: true,
  })
  baseline?: PublishBaseline;
}

@InputType({ description: '获取发布记录的排序参数' })
export class PublishRecordsOrderArgs {
  /** 更新时间 */
  @Field(() => OrderBy, {
    description: '更新时间',
    nullable: true,
  })
  createAt? = OrderBy.DESC;
}

@InputType({ description: '获取发布记录的参数' })
export class PublishRecordsArgs extends PaginationArgs {
  /** 筛选参数 */
  @Field(() => PublishRecordsFilterArgs, {
    description: '筛选参数',
    nullable: true,
  })
  filter?: PublishRecordsFilterArgs;
  /** 排序参数 */
  @Field(() => PublishRecordsOrderArgs, {
    description: '排序参数',
    nullable: true,
  })
  order?: PublishRecordsOrderArgs;
}
