import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { AppsMembersService } from '@/apps-members/apps-members.service';
import { AppsService } from '@/apps/apps.service';
import { LoginUser } from '@/common/decorators/login-user.decorator';
import { App } from '@/common/entities/apps.entity';
import { Component } from '@/common/entities/components.entity';
import { User } from '@/common/entities/users.entity';
import { UserRole } from '@/common/models/user-role.enum';
import { TREE_DEFAULT } from '@/common/utils';
import { ComponentsMembersService } from '@/components-members/components-members.service';
import { ComponentsService } from '@/components/components.service';
import { ILoginUser } from '@/types';

import { NewUserInput } from './dtos/new-user.input';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly appsMembersService: AppsMembersService,
    private readonly appsService: AppsService,
    private readonly componentsService: ComponentsService,
    private readonly componentsMembersService: ComponentsMembersService
  ) {}

  @Mutation(() => User, { description: '创建用户' })
  async userCreate(@Args('user') user: NewUserInput): Promise<User> {
    return this.usersService.createUser(user);
  }

  @Query(() => [User], { description: '用户列表' })
  async users(): Promise<User[]> {
    return this.usersService.listUsers();
  }

  @Query(() => User, { description: '用户详情', nullable: true })
  async user(@Args('id') id: string): Promise<User> {
    return this.usersService.getUserById(id);
  }

  @Query(() => User, { description: '当前用户详情', nullable: true })
  async currentUser(@LoginUser() loginUser: ILoginUser): Promise<User> {
    return loginUser;
  }

  @ResolveField(() => [App], { description: '用户的应用列表' })
  async apps(@LoginUser() loginUser: ILoginUser, @Parent() user: User): Promise<App[]> {
    if (loginUser.id === user.id && loginUser.role === UserRole.SystemAdmin) {
      return this.appsService.listApps(TREE_DEFAULT);
    }
    return this.appsMembersService.listUserApps(TREE_DEFAULT, user.id);
  }

  @ResolveField(() => [App], { description: '用户的组件列表' })
  async components(@LoginUser() loginUser: ILoginUser, @Parent() user: User): Promise<Component[]> {
    if (loginUser.id === user.id && loginUser.role === UserRole.SystemAdmin) {
      return this.componentsService.listComponents(TREE_DEFAULT);
    }
    return this.componentsMembersService.listUserComponents(TREE_DEFAULT, user.id);
  }
}
