import { Logger } from '@nestjs/common';
import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { AppsMembersService } from '@/apps-members/apps-members.service';
import { Auth, UserRole } from '@/common/decorators/auth.decorator';
import { LoginUser } from '@/common/decorators/login-user.decorator';
import { Tree } from '@/common/decorators/tree.decorator';
import { AppMember } from '@/common/entities/apps-members.entity';
import { App } from '@/common/entities/apps.entity';
import { Branch } from '@/common/entities/git/branches.entity';
import { PaginatedCommits } from '@/common/entities/git/commits.entity';
import { MergeRequest } from '@/common/entities/git/merge-request.entity';
import { PublishChannel } from '@/common/entities/publish-channels.entity';
import { PaginatedPublishRecords } from '@/common/entities/publish-records.entity';
import { MemberRole } from '@/common/models/member-role.enum';
import { ValidationPipe } from '@/common/pipes/validation.pipe';
import { TREE_DEFAULT } from '@/common/utils';
import { AppCommitsOptions } from '@/git/dto/app-commits.args';
import { GitService } from '@/git/git.service';
import { PublishChannelsArgs } from '@/publish-channels/dtos/publish-channels.args';
import { PublishChannelsService } from '@/publish-channels/publish-channels.service';
import { PublishRecordsArgs } from '@/publish-records/dtos/publish-records.args';
import { PublishRecordsService } from '@/publish-records/publish-records.service';
import { ILoginUser } from '@/types';

import { UpdateSchemaI18nArgs } from '../common/dto/update-schema-i18n.args';
import { AppsService } from './apps.service';
import { AppI18nExtractInput } from './dtos/app-i18n-extract.input';
import { CheckoutAppNewBranch } from './dtos/checkout-app-new-branch.input';
import { NewAppInput } from './dtos/new-app.input';
import { UpdateAppInput } from './dtos/update-app.input';

@Resolver(() => App)
export class AppsResolver {
  constructor(
    private readonly appsService: AppsService,
    private readonly appsMembersService: AppsMembersService,
    private readonly gitService: GitService,
    private readonly publishChannelsService: PublishChannelsService,
    private readonly publishRecordsService: PublishRecordsService
  ) {}

  logger = new Logger('AppsResolver');

  @Mutation(() => App, { description: '创建应用：创建在 main 分支上' })
  async appCreate(@LoginUser() loginUser: ILoginUser, @Args('app') app: NewAppInput): Promise<App> {
    const res = await this.appsService.createApp(TREE_DEFAULT, loginUser, app);
    return res;
  }

  @Mutation(() => App, { description: '更新应用' })
  async appUpdate(
    @Tree() tree: string,
    @LoginUser() loginUser: ILoginUser,
    @Args('app') app: UpdateAppInput
  ): Promise<App> {
    const res = await this.appsService.updateApp(tree, loginUser, app);
    return res;
  }

  @Mutation(() => App, { description: '修复应用的 namespace 字段' })
  async appFixNamespace(
    @Tree() tree: string,
    @LoginUser() loginUser: ILoginUser,
    @Args('id') id: string,
    @Args('namespace') namespace: string
  ): Promise<App> {
    const res = await this.appsService.fixNamespace(tree, loginUser, id, namespace);
    return res;
  }

  @Mutation(() => JSON, { description: '更新应用的国际化文案' })
  async appUpdateI18n(
    @Tree() tree: string,
    @LoginUser() loginUser: ILoginUser,
    @Args() args: UpdateSchemaI18nArgs
  ): Promise<UpdateSchemaI18nArgs['i18n']> {
    return this.appsService.updateAppI18n(tree, loginUser, args);
  }

  @Auth(UserRole.SystemAdmin)
  @Query(() => [App], { description: '应用列表：main 分支上的' })
  async apps(): Promise<App[]> {
    return this.appsService.listApps(TREE_DEFAULT);
  }

  @Query(() => App, { description: '应用详情', nullable: true })
  async app(
    @Tree() treeFromQuery: string,
    @LoginUser() user: ILoginUser,
    @Args('id') id: string,
    @Args('tree', { nullable: true }) tree: string
  ): Promise<App> {
    return this.appsService.getAppById(tree || treeFromQuery, user, id);
  }

  @ResolveField(() => JSON, {
    description: '包含页面的完整 schema，一般用于出码',
  })
  async fullSchema(@Tree() tree: string, @LoginUser() user: ILoginUser, @Parent() app: App) {
    return this.appsService.getAppFullSchema(tree, user, app);
  }

  @ResolveField(() => JSON, {
    description: '应用国际化文案使用情况',
  })
  async i18nUsage(@Tree() tree: string, @LoginUser() user: ILoginUser, @Parent() app: App) {
    return this.appsService.getI18nUsage(tree, user, app);
  }

  @ResolveField(() => [AppMember], { description: '应用成员' })
  async members(@Parent() app: App): Promise<AppMember[]> {
    return this.appsMembersService.listAppMembers(TREE_DEFAULT, app.id);
  }

  @Mutation(() => Branch, {
    description:
      "为应用创建分支：一般创建出来的分支仅当前用户可用，以 'release-' 开头的分支则比较特殊，仅 Owner 及 Maintainer 可创建，且创建出来后应用成员均可见",
  })
  async appCheckoutNewBranch(
    @LoginUser() loginUser: ILoginUser,
    @Args('branch', { description: '分支信息' }) branch: CheckoutAppNewBranch
  ): Promise<Branch> {
    const res = await this.appsService.checkoutNewBranchForApp(loginUser, branch);
    return res;
  }

  @Mutation(() => Boolean, { description: '为应用删除某个分支' })
  async appDeleteBranch(
    @LoginUser() loginUser: ILoginUser,
    @Args('name', { description: '分支名' }) name: string
  ): Promise<boolean> {
    const res = await this.appsService.deleteBranchForApp(loginUser, name);
    return res;
  }

  @ResolveField(() => [Branch], { description: '分支列表' })
  async branches(@LoginUser() user: ILoginUser, @Parent() app: App): Promise<Branch[]> {
    return this.gitService.listBranchesByIdPrefix(user, app.id);
  }

  @ResolveField(() => [PublishChannel], { description: '发布渠道列表' })
  async publishChannels(
    @LoginUser() user: ILoginUser,
    @Parent() app: App,
    @Args('pubcOptions', { nullable: true }) pubcOptions?: PublishChannelsArgs
  ): Promise<PublishChannel[]> {
    // 仅拥有者和维护者有权限查看发布渠道
    try {
      await this.appsMembersService.checkUserAppMemberRole(user, app.id, {
        must: [MemberRole.Owner, MemberRole.Maintainer],
      });
    } catch (error) {
      this.logger.warn(`User ${user.name} get publishChannels failed of app: ${app.id}`, error);
      return [];
    }
    return this.publishChannelsService.getPublishChannelsByAppId(app.id, pubcOptions);
  }

  @ResolveField(() => PaginatedPublishRecords, {
    description: '分页的发布记录列表',
  })
  async paginatedPublishRecords(
    @LoginUser() user: ILoginUser,
    @Parent() app: App,
    @Args('pubrOptions', { nullable: true }) pubrOptions?: PublishRecordsArgs
  ): Promise<PaginatedPublishRecords> {
    return this.publishRecordsService.getPublishRecordsByAppId(user, app.id, pubrOptions);
  }

  @ResolveField(() => PaginatedCommits, { description: '提交记录' })
  async commits(
    @Tree() tree: string,
    @Parent() app: App,
    @Args('options', { nullable: true }, new ValidationPipe())
    options: AppCommitsOptions
  ): Promise<PaginatedCommits> {
    return this.gitService.listAppPaginatedCommits(app.tree || tree, app.id, options);
  }

  @Mutation(() => Branch, {
    description: '提取应用中的中文文案为国际化变量，并将改动内容提交为 merge request 到当前分支',
  })
  async appI18nExtract(
    @LoginUser() loginUser: ILoginUser,
    @Args('input', { description: '参数信息' }) input: AppI18nExtractInput
  ): Promise<MergeRequest> {
    const res = await this.appsService.appI18nExtract(loginUser, input);
    return res;
  }
}
