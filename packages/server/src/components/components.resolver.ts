import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { Auth, UserRole } from '@/common/decorators/auth.decorator';
import { LoginUser } from '@/common/decorators/login-user.decorator';
import { Tree } from '@/common/decorators/tree.decorator';
import { UpdateSchemaI18nArgs } from '@/common/dto/update-schema-i18n.args';
import { ComponentMember } from '@/common/entities/components-members.entity';
import { ComponentVersion } from '@/common/entities/components-versions.entity';
import { Component } from '@/common/entities/components.entity';
import { Branch } from '@/common/entities/git/branches.entity';
import { PaginatedCommits } from '@/common/entities/git/commits.entity';
import { ValidationPipe } from '@/common/pipes/validation.pipe';
import { TREE_DEFAULT } from '@/common/utils';
import { ComponentsMembersService } from '@/components-members/components-members.service';
import { ComponentsVersionsService } from '@/components-versions/components-versions.service';
import { CommitsArgs } from '@/git/dto/commits.args';
import { GitService } from '@/git/git.service';
import { CommitResult } from '@/git/models/commit-result.model';
import { ILoginUser } from '@/types';

import { ComponentsService } from './components.service';
import { NewComponentInput } from './dtos/new-component.input';
import { ReleaseComponentInput } from './dtos/release-component.input';
import { UpdateComponentInput } from './dtos/update-component.input';

@Resolver(() => Component)
export class ComponentsResolver {
  constructor(
    private readonly componentsService: ComponentsService,
    private readonly componentsMembersService: ComponentsMembersService,
    private readonly componentsVersionsService: ComponentsVersionsService,
    private readonly gitService: GitService
  ) {}

  @Mutation(() => Component, { description: '创建组件：创建在 main 分支上' })
  async componentCreate(
    @LoginUser() loginUser: ILoginUser,
    @Args('component') component: NewComponentInput
  ): Promise<Component> {
    const res = await this.componentsService.createComponent(TREE_DEFAULT, loginUser, component);
    return res;
  }

  @Mutation(() => Component, { description: '更新组件' })
  async componentUpdate(
    @Tree() tree: string,
    @LoginUser() loginUser: ILoginUser,
    @Args('component') component: UpdateComponentInput
  ): Promise<Component> {
    const res = await this.componentsService.updateComponent(tree, loginUser, component);
    return res;
  }

  @Mutation(() => JSON, { description: '更新组件的国际化文案' })
  async componentUpdateI18n(
    @Tree() tree: string,
    @LoginUser() loginUser: ILoginUser,
    @Args() args: UpdateSchemaI18nArgs
  ): Promise<UpdateSchemaI18nArgs['i18n']> {
    return this.componentsService.updateComponentI18n(tree, loginUser, args);
  }

  @Auth(UserRole.SystemAdmin)
  @Query(() => [Component], { description: '组件列表：main 分支上的' })
  async components(): Promise<Component[]> {
    return this.componentsService.listComponents(TREE_DEFAULT);
  }

  @Query(() => Component, { description: '组件详情', nullable: true })
  async component(
    @Tree() treeFromQuery: string,
    @LoginUser() user: ILoginUser,
    @Args('id') id: string,
    @Args('tree', { nullable: true }) tree: string
  ): Promise<Component> {
    return this.componentsService.getComponentById(tree || treeFromQuery, user, id);
  }

  @ResolveField(() => JSON, {
    description: '组件国际化文案使用情况',
  })
  async i18nUsage(
    @Tree() tree: string,
    @LoginUser() user: ILoginUser,
    @Parent() component: Component
  ) {
    return this.componentsService.getI18nUsage(component);
  }

  @ResolveField(() => [ComponentMember], { description: '组件成员' })
  async members(@Tree() tree: string, @Parent() component: Component): Promise<ComponentMember[]> {
    return this.componentsMembersService.listComponentMembers(tree, component.id);
  }

  @ResolveField(() => PaginatedCommits, { description: '提交记录' })
  async commits(
    @Tree() tree: string,
    @Parent() component: Component,
    @Args('commitsArgs', { nullable: true }, new ValidationPipe())
    commitsArgs: CommitsArgs
  ): Promise<PaginatedCommits> {
    const { nodes, ...otherProps } = await this.gitService.listHistoryComponents(
      tree,
      component.id,
      commitsArgs
    );
    return {
      ...otherProps,
      nodes: nodes.map(({ commit }) => commit),
    };
  }

  @Mutation(() => CommitResult, { description: '提交组件的更改' })
  async componentCommit(
    @Tree() tree: string,
    @LoginUser() loginUser: ILoginUser,
    @Args('id') id: string,
    @Args('message') message: string
  ): Promise<CommitResult> {
    return this.componentsService.commitComponent(tree, loginUser, id, message);
  }

  @Mutation(() => ComponentVersion, {
    description: '发布组件',
  })
  async componentRelease(
    @Tree() tree: string,
    @LoginUser() loginUser: ILoginUser,
    @Args('release') release: ReleaseComponentInput
  ): Promise<ComponentVersion> {
    return this.componentsService.releaseComponent(tree, loginUser, release);
  }

  @ResolveField(() => [Branch], { description: '分支列表' })
  async branches(@LoginUser() user: ILoginUser, @Parent() component: Component): Promise<Branch[]> {
    return this.gitService.listBranchesByIdPrefix(user, component.id);
  }

  @ResolveField(() => [ComponentVersion], { description: '版本列表' })
  async versions(
    @LoginUser() user: ILoginUser,
    @Parent() component: Component
  ): Promise<ComponentVersion[]> {
    if (component.versions) {
      return component.versions;
    }
    return this.componentsVersionsService.listComponentVersions(TREE_DEFAULT, component.id);
  }
}
