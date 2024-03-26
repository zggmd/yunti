import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { LoginUser } from '@/common/decorators/login-user.decorator';
import { PublishChannel } from '@/common/entities/publish-channels.entity';
import { ValidationPipe } from '@/common/pipes/validation.pipe';
import { ILoginUser } from '@/types';

import { DeletePublishChannelArgs } from './dtos/delete-publish-channel.args';
import { NewPublishChannelInput } from './dtos/new-publish-channel.input';
import { UpdatePublishChannelInput } from './dtos/update-publish-channel.input';
import { PublishChannelsService } from './publish-channels.service';

@Resolver(() => PublishChannel)
export class PublishChannelsResolver {
  constructor(private readonly publishChannelsService: PublishChannelsService) {}

  @Mutation(() => PublishChannel, {
    description: '创建发布渠道：创建在 main 分支上',
  })
  async publishChannelCreate(
    @LoginUser() loginUser: ILoginUser,
    @Args('channel', new ValidationPipe({ transform: true }))
    channel: NewPublishChannelInput
  ): Promise<PublishChannel> {
    const res = await this.publishChannelsService.createPublishChannel(loginUser, channel);
    return res;
  }

  @Mutation(() => Boolean, { description: '删除发布渠道' })
  async publishChannelDelete(
    @LoginUser() loginUser: ILoginUser,
    @Args() args: DeletePublishChannelArgs
  ): Promise<boolean> {
    return this.publishChannelsService.deletePublishChannel(loginUser, args);
  }

  @Mutation(() => PublishChannel, {
    description: '修改发布渠道',
  })
  async publishChannelUpdate(
    @LoginUser() loginUser: ILoginUser,
    @Args('channel', new ValidationPipe({ transform: true }))
    channel: UpdatePublishChannelInput
  ): Promise<PublishChannel> {
    const res = await this.publishChannelsService.updatePublishChannel(loginUser, channel);
    return res;
  }

  @Query(() => PublishChannel, { description: '发布渠道详情', nullable: true })
  async publishChannel(
    @LoginUser() loginUser: ILoginUser,
    @Args('id') id: string
  ): Promise<PublishChannel> {
    return this.publishChannelsService.getPublishChannelById(id, loginUser);
  }
}
