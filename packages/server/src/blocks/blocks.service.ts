import { Injectable, NotFoundException } from '@nestjs/common';

import { Block } from '@/common/entities/blocks.entity';
import { UserRole } from '@/common/models/user-role.enum';
import treeDataSources from '@/common/tree-data-sources';
import { CustomException, genNanoid } from '@/common/utils';
import { GitService } from '@/git/git.service';
import { ILoginUser } from '@/types';

import { NewBlockInput } from './dtos/new-block.input';
import { UpdateBlockInput } from './dtos/update-block.input';

@Injectable()
export class BlocksService {
  constructor(private readonly gitService: GitService) {}

  getBlocksRepository = (tree: string) => treeDataSources.getRepository<Block>(tree, Block);

  async createBlock(tree: string, loginUser: ILoginUser, body: NewBlockInput) {
    const blocksRepository = await this.getBlocksRepository(tree);
    const id = genNanoid('block');
    const block = {
      ...body,
      id,
      creatorId: loginUser.id,
    };
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await blocksRepository.insert(block);
    await this.gitService.commitNt(tree, {
      committer: loginUser,
      tables: [Block.tableName],
      message: `Create block ${body.name}(${id})`,
    });
    return blocksRepository.findOneBy({ id });
  }

  async deleteBlock(tree: string, loginUser: ILoginUser, id: string) {
    await this.checkUserPermission(tree, loginUser, id);
    const blocksRepository = await this.getBlocksRepository(tree);
    const res = await blocksRepository.delete(id);
    await this.gitService.commitNt(tree, {
      committer: loginUser,
      tables: [Block.tableName],
      message: `Delete block ${id}.`,
    });
    return res;
  }

  async updateBlock(tree: string, loginUser: ILoginUser, body: UpdateBlockInput) {
    const { id, ...block } = body;
    await this.checkUserPermission(tree, loginUser, id);
    const blocksRepository = await this.getBlocksRepository(tree);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const res = await blocksRepository.update(id, block);
    if (res.affected === 0) {
      throw new NotFoundException(`block ${id} not found`);
    }
    await this.gitService.commitNt(tree, {
      committer: loginUser,
      tables: [Block.tableName],
      message: `Update block ${body.name}(${id})`,
    });
    return this.getBlockById(tree, id);
  }

  async listBlocks(tree: string) {
    const blocksRepository = await this.getBlocksRepository(tree);
    return blocksRepository.find({
      order: {
        createAt: 'DESC',
      },
      relations: {
        creator: true,
      },
    });
  }

  async getBlockById(tree: string, id: string) {
    const blocksRepository = await this.getBlocksRepository(tree);
    return blocksRepository.findOne({
      where: { id },
      relations: {
        creator: true,
      },
    });
  }

  /**
   * 检查用户是否有操作区块的权限
   * 只有管理员以及区块创建者才有权限
   *
   * @param {ILoginUser} user 登录用户
   * @param {string} blockId 区块 Id
   * @memberof BlocksService
   */
  async checkUserPermission(tree: string, user: ILoginUser, blockId: string) {
    if (user.role === UserRole.SystemAdmin) {
      return;
    }
    const block = await this.getBlockById(tree, blockId);
    if (block?.creatorId !== user.id) {
      throw new CustomException(
        'Forbidden',
        `You do not have permission for block ${blockId}`,
        403,
        {
          name: blockId,
          kind: Block.name,
        }
      );
    }
  }
}
