import { Field, InputType, PartialType } from '@nestjs/graphql';

import { PublishStatusDetail } from '../models/publish-record.model';
import { PublishStatus } from '../models/publish-status.enum';

@InputType({ description: '发布状态详情' })
export class PublishStatusDetailInput extends PartialType(PublishStatusDetail) {}

@InputType({ description: '流水线详情' })
export class PublishRecordBuildInfo {
  /** 构建类型，流水线还是啥 */
  type?: string;

  /** 其他信息 */
  @Field(() => JSON, {
    description: '其他信息',
    nullable: true,
  })
  info?: Record<string, any>;
}

@InputType({ description: '发布记录详情' })
export class PublishRecordDetailInput {
  /** 状态详情 */
  @Field(() => PublishStatusDetailInput, {
    description: '状态详情',
    nullable: true,
  })
  status?: PublishStatusDetailInput;

  /** 流水线详情 */
  @Field(() => PublishRecordBuildInfo, {
    description: '流水线详情',
    nullable: true,
  })
  build?: PublishRecordBuildInfo;
}

@InputType()
export class UpdatePublishInput {
  /** 发布状态 */
  @Field(() => PublishStatus, {
    description: '发布状态',
    nullable: true,
  })
  status?: PublishStatus;

  /** 发布记录详情 */
  @Field(() => PublishRecordDetailInput, {
    description: '发布详情',
    nullable: true,
  })
  detail?: PublishRecordDetailInput;
}
