import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { LoginUser } from '@/common/decorators/login-user.decorator';
import { MergeRequest } from '@/common/entities/merge-request.entity';
import { ILoginUser } from '@/types';

import { ConflictResolveInput } from './dto/conflict-resolve.input';
import { MergeRequestSearchInput } from './dto/merge-request-search.args';
import { MergeRequestInput } from './dto/merge-request.args';
import { MergeRequestService } from './merge-requests.service';
import { MergeRequestDetail, MergeRequestDiff } from './models/merge-request-detail.model';

@Resolver(() => MergeRequest)
export class MergeRequestResolver {
  constructor(private readonly mergeRequestService: MergeRequestService) {}

  @Mutation(() => MergeRequest)
  async createMergeRequest(
    @LoginUser() loginUser: ILoginUser,
    @Args('mergeRequestParam', { description: '合并请求内容 ' })
    mergeRequestParam: MergeRequestInput
  ) {
    return await this.mergeRequestService.createMergeRequest(loginUser, mergeRequestParam);
  }

  @Query(() => [MergeRequest])
  async getMergeRequests(
    @LoginUser() loginUser: ILoginUser,
    @Args('searchParam', { description: '合并请求内容 ' })
    searchParam: MergeRequestSearchInput
  ) {
    return await this.mergeRequestService.getMergeRequests(loginUser, searchParam);
  }

  @Query(() => MergeRequestDiff)
  async getBranchesDiff(
    @Args('targetBranch', { description: '目标分支' })
    targetBranch: string,
    @Args('sourceBranch', { description: '对比分支' })
    sourceBranch: string
  ) {
    return await this.mergeRequestService.getBranchesDiff(targetBranch, sourceBranch);
  }

  @Query(() => MergeRequestDetail, {
    description: '查看合并详细内容 ',
    nullable: true,
  })
  async getMergeRequest(@Args('id') id: number) {
    return await this.mergeRequestService.getMergeRequest(id);
  }

  @Mutation(() => JSON)
  async closeMergeRequests(@LoginUser() loginUser: ILoginUser, @Args('id') id: number) {
    return await this.mergeRequestService.closeMergeRequests(loginUser, id);
  }

  @Mutation(() => JSON)
  async mergeRequests(@LoginUser() loginUser: ILoginUser, @Args('id') id: number) {
    return await this.mergeRequestService.mergeRequest(loginUser, id);
  }

  @Mutation(() => JSON)
  async resolveConflict(
    @LoginUser() loginUser: ILoginUser,
    @Args('conflictResolveInput') conflictResolveInput: ConflictResolveInput
  ) {
    return await this.mergeRequestService.resolveConflict(loginUser, conflictResolveInput);
  }
}
