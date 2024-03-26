import { Field, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsUrl, ValidateIf, ValidateNested } from 'class-validator';

import { DecodeBase64Transform } from '@/common/filed-transform/decode-base64.transform';

import { PublishChannelType } from '../models/publish-channel-type.enum';

@InputType({ description: 'helm 仓库详情' })
export class PublishChannelHelmInput {
  /** 地址 */
  @IsUrl({ require_protocol: true })
  url: string;

  /** 用户名 (base64) */
  @DecodeBase64Transform()
  username?: string;

  /** 密码 (base64) */
  @DecodeBase64Transform({ encrypt: true })
  password?: string;
}

@InputType({ description: 'gitHub 仓库详情' })
export class PublishChannelGitHubInput {
  /** 令牌 */
  token: string;
  // @Todo
}

@InputType()
export class NewPublishChannelInput {
  /** 是否内置渠道 */
  builtIn?: boolean = false;

  /** 应用 id (非内置渠道时必填) */
  @ValidateIf((p: NewPublishChannelInput) => !p.builtIn)
  @IsNotEmpty()
  appId?: string;

  /** 渠道名称 */
  name: string;

  /** 渠道类型 */
  @Field(() => PublishChannelType, { description: '渠道类型' })
  type: PublishChannelType;

  /** helm 渠道详情 */
  @ValidateIf((p: NewPublishChannelInput) => p.type === PublishChannelType.Helm)
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PublishChannelHelmInput)
  @Field(() => PublishChannelHelmInput, {
    description: 'helm 渠道详情',
    nullable: true,
  })
  helm?: PublishChannelHelmInput;

  /** github 渠道详情 */
  @ValidateIf((p: NewPublishChannelInput) => p.type === PublishChannelType.Github)
  @IsNotEmpty()
  @Field(() => PublishChannelGitHubInput, {
    description: 'github 渠道详情',
    nullable: true,
  })
  github?: PublishChannelGitHubInput;
}
