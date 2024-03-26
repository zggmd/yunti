import { Args, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { Tree } from '@/common/decorators/tree.decorator';
import { Branch } from '@/common/entities/git/branches.entity';
import { Commit } from '@/common/entities/git/commits.entity';
import { PaginatedLog } from '@/common/entities/git/log.entity';
import { Tag } from '@/common/entities/git/tags.entity';

import { CommitsArgs } from './dto/commits.args';
// import { Status } from '@/common/entities/git/status.entity';
import { GitService } from './git.service';
import { Git } from './models/git.model';

@Resolver(() => Git)
export class GitResolver {
  constructor(private readonly gitService: GitService) {}

  @Query(() => Git, { description: '提交信息' })
  async git(): Promise<Git> {
    return {};
  }

  @ResolveField(() => Commit, { description: '提交详情' })
  async commit(@Tree() tree: string, @Args('id') id: string): Promise<Commit> {
    return this.gitService.getCommitById(tree, id);
  }

  @ResolveField(() => PaginatedLog, { description: '提交日志' })
  async log(
    @Tree() tree: string,
    @Args('logArgs', { nullable: true }) logArgs: CommitsArgs
  ): Promise<PaginatedLog> {
    return this.gitService.listPaginatedLog(tree, logArgs);
  }

  @ResolveField(() => [Branch], { description: '分支列表' })
  async branches(): Promise<Branch[]> {
    return this.gitService.listBranches();
  }

  @ResolveField(() => [Tag], { description: '标签列表' })
  async tags(): Promise<Tag[]> {
    return this.gitService.listTags();
  }

  // status 不适合对外暴露，会泄露表名
  // @ResolveField(() => [Status], { description: '提交状态' })
  // async status(@Tree() tree: string): Promise<Status[]> {
  //   return this.gitService.listStatus(tree);
  // }
}
