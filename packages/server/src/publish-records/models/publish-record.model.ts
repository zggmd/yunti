import { Field, HideField, ObjectType } from '@nestjs/graphql';

import { Commit } from '@/common/entities/git/commits.entity';
import { PublishChannel } from '@/common/entities/publish-channels.entity';

@ObjectType({ description: '发布状态详情' })
export class PublishStatusDetail {
  /** 进度百分比 */
  progress?: number;

  /** 详细信息 */
  message?: string;
}

@ObjectType({ description: '发布记录详情' })
export class PublishRecordDetail {
  /** 发布名称：一般是应用的 namespace */
  name: string;

  /** 展示名称：一般是应用的名称*/
  displayName: string;

  /** 提交信息 */
  @Field(() => Commit, {
    description: '提交信息',
  })
  commit: Commit;

  /** 渠道详情 */
  @Field(() => JSON, {
    description: '渠道详情',
    nullable: true,
  })
  channel: Partial<PublishChannel>;

  /** 状态详情 */
  @Field(() => PublishStatusDetail, {
    description: '状态详情',
    nullable: true,
  })
  status?: PublishStatusDetail;

  /** 构建详情 */
  @HideField()
  build?: any;
}
