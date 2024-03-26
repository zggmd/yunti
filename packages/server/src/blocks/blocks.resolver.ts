import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { LoginUser } from '@/common/decorators/login-user.decorator';
import { Block } from '@/common/entities/blocks.entity';
import { TREE_DEFAULT } from '@/common/utils';
import { ILoginUser } from '@/types';

import { BlocksService } from './blocks.service';
import { NewBlockInput } from './dtos/new-block.input';
import { UpdateBlockInput } from './dtos/update-block.input';

@Resolver(() => Block)
export class BlocksResolver {
  constructor(private readonly blocksService: BlocksService) {}

  @Mutation(() => Block, { description: '创建区块' })
  async blockCreate(
    @LoginUser() loginUser: ILoginUser,
    @Args('block') block: NewBlockInput
  ): Promise<Block> {
    const res = await this.blocksService.createBlock(TREE_DEFAULT, loginUser, block);
    return res;
  }

  @Mutation(() => Boolean, { description: '删除区块' })
  async blockDelete(@LoginUser() loginUser: ILoginUser, @Args('id') id: string): Promise<boolean> {
    await this.blocksService.deleteBlock(TREE_DEFAULT, loginUser, id);
    return true;
  }

  @Mutation(() => Block, { description: '更新区块' })
  async blockUpdate(
    @LoginUser() loginUser: ILoginUser,
    @Args('block') block: UpdateBlockInput
  ): Promise<Block> {
    const res = await this.blocksService.updateBlock(TREE_DEFAULT, loginUser, block);
    return res;
  }

  @Query(() => [Block], { description: '区块列表' })
  async blocks(): Promise<Block[]> {
    return this.blocksService.listBlocks(TREE_DEFAULT);
  }

  @Query(() => Block, { description: '区块详情', nullable: true })
  async block(@Args('id') id: string): Promise<Block> {
    return this.blocksService.getBlockById(TREE_DEFAULT, id);
  }
}
