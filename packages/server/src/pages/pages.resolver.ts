import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { LoginUser } from '@/common/decorators/login-user.decorator';
import { Tree } from '@/common/decorators/tree.decorator';
import { PaginatedCommits } from '@/common/entities/git/commits.entity';
import { Page } from '@/common/entities/pages.entity';
import { ValidationPipe } from '@/common/pipes/validation.pipe';
import { GitService } from '@/git/git.service';
import { CommitResult } from '@/git/models/commit-result.model';
import { ILoginUser } from '@/types';

import { CommitsArgs } from '../git/dto/commits.args';
import { NewPageInput } from './dtos/new-page.input';
import { UpdatePageInput } from './dtos/update-page.input';
import { PagesService } from './pages.service';

@Resolver(() => Page)
export class PagesResolver {
  constructor(
    private readonly pagesService: PagesService,
    private readonly gitService: GitService
  ) {}

  @Mutation(() => Page, { description: '创建页面' })
  async pageCreate(
    @Tree() tree: string,
    @LoginUser() loginUser: ILoginUser,
    @Args('page') page: NewPageInput
  ): Promise<Page> {
    const res = await this.pagesService.createPage(tree, loginUser, page);
    return res;
  }

  @Mutation(() => Page, { description: '更新页面' })
  async pageUpdate(
    @Tree() tree: string,
    @LoginUser() loginUser: ILoginUser,
    @Args('page') page: UpdatePageInput
  ): Promise<Page> {
    const res = await this.pagesService.updatePage(tree, loginUser, page);
    return res;
  }

  @Mutation(() => CommitResult, { description: '提交页面的更改' })
  async pageCommit(
    @Tree() tree: string,
    @LoginUser() loginUser: ILoginUser,
    @Args('id') id: string,
    @Args('message') message: string
  ): Promise<CommitResult> {
    return this.pagesService.commitPage(tree, loginUser, id, message);
  }

  @Query(() => Page, { description: '页面详情', nullable: true })
  async page(
    @Tree() tree: string,
    @LoginUser() loginUser: ILoginUser,
    @Args('id') id: string
  ): Promise<Page> {
    return this.pagesService.getPageById(tree, loginUser, id);
  }

  @Mutation(() => Boolean, { description: '删除页面' })
  async pageDelete(
    @Tree() tree: string,
    @LoginUser() loginUser: ILoginUser,
    @Args('id') id: string
  ): Promise<boolean> {
    await this.pagesService.deletePage(tree, loginUser, id);
    return true;
  }

  @ResolveField(() => PaginatedCommits, { description: '提交记录' })
  async commits(
    @Tree() tree: string,
    @Parent() page: Page,
    @Args('commitsArgs', { nullable: true }, new ValidationPipe())
    commitsArgs: CommitsArgs
  ): Promise<PaginatedCommits> {
    // return this.gitService.listPagecommits(tree, page.id);
    const { nodes, ...otherProps } = await this.gitService.listHistoryPages(
      tree,
      page.id,
      commitsArgs
    );
    return {
      ...otherProps,
      nodes: nodes.map(({ commit }) => commit),
    };
  }
}
