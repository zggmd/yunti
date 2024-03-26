import { Field, InputType, PartialType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateIf, ValidateNested } from 'class-validator';

import { PublishChannelType } from '../models/publish-channel-type.enum';
import { PublishChannelGitHubInput, PublishChannelHelmInput } from './new-publish-channel.input';

@InputType({ description: 'helm 仓库详情' })
export class PublishChannelHelmUpdateInput extends PartialType(PublishChannelHelmInput) {}

@InputType({ description: 'gitHub 仓库详情' })
export class PublishChannelGithubUpdateInput extends PartialType(PublishChannelGitHubInput) {}

@InputType()
export class UpdatePublishChannelInput {
  /** 发布渠道 id */
  id: string;

  /** 渠道类型 */
  @Field(() => PublishChannelType, { description: '渠道类型' })
  type: PublishChannelType;

  /** helm 渠道详情 */
  @ValidateIf((p: UpdatePublishChannelInput) => p.type === PublishChannelType.Helm)
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PublishChannelHelmUpdateInput)
  @Field(() => PublishChannelHelmUpdateInput, {
    description: 'helm 渠道详情',
    nullable: true,
  })
  helm?: PublishChannelHelmUpdateInput;

  /** github 渠道详情 */
  @ValidateIf((p: UpdatePublishChannelInput) => p.type === PublishChannelType.Github)
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PublishChannelGithubUpdateInput)
  @Field(() => PublishChannelGithubUpdateInput, {
    description: 'github 渠道详情',
    nullable: true,
  })
  github?: PublishChannelGithubUpdateInput;
}
