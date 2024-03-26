import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsSemVer, ValidateIf } from 'class-validator';

import { PublishBaseline } from '../models/publish-baseline.enum';

@InputType()
export class NewPublishInput {
  /** 应用 id (选择内置仓库时必填) */
  appId?: string;

  /** 渠道 id */
  channelId: string;

  /** 发布名称：一般是应用的 namespace */
  name: string;

  /** 展示名称：一般是应用的名称*/
  displayName: string;

  /** 发布基线 */
  @Field(() => PublishBaseline, {
    description: '发布基线',
  })
  baseline: PublishBaseline;

  /** 分支名、标签名 或 提交 ID */
  tree: string;

  /** 提交 ID，当发布基线为分支或标签时必填 */
  @ValidateIf(
    (p: NewPublishInput) =>
      p.baseline === PublishBaseline.Branch || p.baseline === PublishBaseline.Tag
  )
  @IsNotEmpty()
  commitId?: string;

  /** 发布版本 */
  @IsSemVer()
  version: string;
}
