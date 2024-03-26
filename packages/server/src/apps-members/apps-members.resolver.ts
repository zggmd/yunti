import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { LoginUser } from '@/common/decorators/login-user.decorator';
import { AppMember } from '@/common/entities/apps-members.entity';
import { TREE_DEFAULT } from '@/common/utils';
import { ILoginUser } from '@/types';

import { AppsMembersService } from './apps-members.service';
import { AddAppMemberInput } from './dtos/add-app-members.input';

@Resolver(() => AppMember)
export class AppsMembersResolver {
  constructor(private readonly appsMembersService: AppsMembersService) {}

  @Mutation(() => AppMember, { description: '添加应用成员' })
  async appMemberAdd(
    @LoginUser() loginUser: ILoginUser,
    @Args('appMember') appMember: AddAppMemberInput
  ): Promise<AppMember> {
    const res = await this.appsMembersService.addAppMember(TREE_DEFAULT, loginUser, appMember);
    return res;
  }

  @Mutation(() => Boolean, { description: '移除应用成员' })
  async appMemberRemove(
    @LoginUser() loginUser: ILoginUser,
    @Args('appId') appId: string,
    @Args('userId') userId: string
  ): Promise<boolean> {
    const res = await this.appsMembersService.removeAppMember(
      TREE_DEFAULT,
      loginUser,
      appId,
      userId
    );
    return res;
  }
}
