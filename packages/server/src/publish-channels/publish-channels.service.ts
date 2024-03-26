import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Like } from 'typeorm';

import { AppsMembersService } from '@/apps-members/apps-members.service';
import { ChartmuseumService } from '@/chartmuseum/chartmuseum.service';
import { PublishChannel } from '@/common/entities/publish-channels.entity';
import { PublishRecord } from '@/common/entities/publish-records.entity';
import { MemberRole } from '@/common/models/member-role.enum';
import { OrderBy } from '@/common/models/order-by.enum';
import { UserRole } from '@/common/models/user-role.enum';
import treeDataSources from '@/common/tree-data-sources';
import { CustomException, TREE_DEFAULT, genNanoid } from '@/common/utils';
import serverConfig from '@/config/server.config';
import { GitService } from '@/git/git.service';
import { PublishChannelHelm } from '@/publish-channels-helm/models/publish-channel-helm.model';
import { ILoginUser } from '@/types';

import { DeletePublishChannelArgs } from './dtos/delete-publish-channel.args';
import { NewPublishChannelInput } from './dtos/new-publish-channel.input';
import { PublishChannelsArgs, PublishChannelsOrderArgs } from './dtos/publish-channels.args';
import {
  PublishChannelHelmUpdateInput,
  UpdatePublishChannelInput,
} from './dtos/update-publish-channel.input';
import { PublishChannelDetail } from './models/publish-channel-detail.model';
import { PublishChannelType } from './models/publish-channel-type.enum';

@Injectable()
export class PublishChannelsService {
  constructor(
    @Inject(serverConfig.KEY)
    private config: ConfigType<typeof serverConfig>,
    private readonly gitService: GitService,
    private readonly appsMembersService: AppsMembersService,
    private readonly chartmuseumService: ChartmuseumService
  ) {}

  logger = new Logger('PublishChannelsService');

  getPublishChannelsRepository = () =>
    treeDataSources.getRepository<PublishChannel>(TREE_DEFAULT, PublishChannel);

  private async getPubcStatus(type: PublishChannelType, detail: typeof PublishChannelDetail) {
    switch (type) {
      case PublishChannelType.Github:
      case PublishChannelType.Gitlab: {
        return;
      }
      case PublishChannelType.Helm: {
        return this.chartmuseumService.checkHealthy((detail as PublishChannelHelm).url);
      }
    }
  }

  async createPublishChannel(loginUser: ILoginUser, body: NewPublishChannelInput) {
    if (body.builtIn) {
      // 仅系统管理员可创建内置渠道
      if (loginUser.role !== UserRole.SystemAdmin) {
        throw new CustomException(
          'Forbidden',
          `only system admin can create built-in channel`,
          403,
          { body }
        );
      }
    } else {
      // 仅应用拥有者及维护者可添加非内置渠道
      await this.appsMembersService.checkUserAppMemberRole(loginUser, body.appId, {
        must: [MemberRole.Owner, MemberRole.Maintainer],
      });
    }
    const publishChannelsRepository = await this.getPublishChannelsRepository();
    const id = genNanoid('pubc');
    const { builtIn, appId, name, type } = body;
    // 检查是否有同名内置渠道（非内置渠道有和 appId 的联合唯一索引，不需要检查）
    if (body.builtIn) {
      const count = await publishChannelsRepository.count({ where: { name } });
      if (count > 0) {
        throw new CustomException('Conflict', `publish channel ${name} already exist.`, 409, {
          body,
        });
      }
    }
    const detail = body[body.type.toLowerCase()];
    const pubChannel = {
      id,
      name,
      builtIn,
      appId,
      type,
      status: await this.getPubcStatus(type, detail),
      detail,
      updatorId: loginUser.id,
    };
    await publishChannelsRepository.insert(pubChannel);
    await this.gitService.commitNt(TREE_DEFAULT, {
      committer: loginUser,
      tables: [PublishChannel.tableName],
      message: `Create publish channel ${id}`,
    });
    return publishChannelsRepository.findOneBy({ id });
  }

  async deletePublishChannel(
    loginUser: ILoginUser,
    { id, clearPublishRecords }: DeletePublishChannelArgs
  ) {
    const publishChannelsRepository = await this.getPublishChannelsRepository();
    const pubc = await publishChannelsRepository.findOneBy({ id });
    if (!pubc) {
      return true;
    }
    if (pubc.builtIn) {
      // 仅系统管理员可删除内置渠道
      if (loginUser.role !== UserRole.SystemAdmin) {
        throw new CustomException(
          'Forbidden',
          `only system admin can delete built-in channel`,
          403,
          { id, clearPublishRecords }
        );
      }
    } else {
      // 仅应用拥有者及维护者可删除非内置渠道
      await this.appsMembersService.checkUserAppMemberRole(loginUser, pubc.appId, {
        must: [MemberRole.Owner, MemberRole.Maintainer],
      });
    }
    const dataSource = await treeDataSources.getDataSource();
    const queryRunner = dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // 由于外键的存在，先删除渠道的话会把发布记录中的渠道 id 设置为 null，所以这里需要先删除发布记录
      if (clearPublishRecords) {
        await queryRunner.manager.delete(PublishRecord, { channelId: id });
      }
      await queryRunner.manager.delete(PublishChannel, { id });

      await this.gitService.commit({
        committer: loginUser,
        tables: [PublishChannel.tableName],
        message: `Delete publish channel ${id}`,
        queryRunner,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      // since we have errors lets rollback the changes we made
      this.logger.error('deletePublishChannel failed', error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
    return true;
  }

  async updatePublishChannel(loginUser: ILoginUser, body: UpdatePublishChannelInput) {
    const { id, type } = body;
    const publishChannelsRepository = await this.getPublishChannelsRepository();
    const pubc = await publishChannelsRepository.findOneBy({ id });
    if (!pubc) {
      throw new CustomException('NotFound', `can not find publish channel ${id}`, 404, body);
    }
    if (pubc.builtIn) {
      // 仅系统管理员可更新内置渠道
      if (loginUser.role !== UserRole.SystemAdmin) {
        throw new CustomException(
          'Forbidden',
          `only system admin can update built-in channel`,
          403,
          { body }
        );
      }
    } else {
      // 仅应用拥有者及维护者可更新非内置渠道
      await this.appsMembersService.checkUserAppMemberRole(loginUser, pubc.appId, {
        must: [MemberRole.Owner, MemberRole.Maintainer],
      });
    }
    const detail: PublishChannelHelmUpdateInput = body[type.toLowerCase()];
    // 更新时也同步更新下状态
    const status = await this.getPubcStatus(type, pubc.detail);
    await publishChannelsRepository.update(id, {
      detail: Object.assign({}, pubc.detail, detail),
      updatorId: loginUser.id,
      status,
    });
    await this.gitService.commitNt(TREE_DEFAULT, {
      committer: loginUser,
      tables: [PublishChannel.tableName],
      message: `Update publish channel ${id}`,
    });
    return publishChannelsRepository.findOneBy({ id });
  }

  async getPublishChannelsByAppId(appId: string, options?: PublishChannelsArgs) {
    const publishChannelsRepository = await this.getPublishChannelsRepository();
    if (!options) {
      options = new PublishChannelsArgs();
    }
    if (!options.order) {
      // 默认按照创建时间排序，新创建的排前面
      options.order = new PublishChannelsOrderArgs();
      options.order.createAt = OrderBy.DESC;
    }
    const { filter, order } = options;
    const { q, type, status } = filter || {};
    // @Todo: 重复的 sql 条件
    const pubcs = await publishChannelsRepository.find({
      where: [
        {
          builtIn: false,
          appId,
          type,
          status,
          name: q && q.trim() && Like(`%${q}%`),
        },
        // 同时返回内置渠道
        {
          builtIn: true,
          type,
          status,
          name: q && q.trim() && Like(`%${q}%`),
        },
      ],
      order,
      relations: { updator: true },
    });
    return pubcs;
  }

  async getPublishChannelById(id: string, loginUser: ILoginUser) {
    const publishChannelsRepository = await this.getPublishChannelsRepository();
    const pubc = await publishChannelsRepository.findOne({
      where: { id },
    });
    // 内置渠道不做权限校验
    if (!pubc || pubc.builtIn) {
      return pubc;
    }
    // 仅应用拥有者及维护者可获取发布渠道
    await this.appsMembersService.checkUserAppMemberRole(loginUser, pubc.appId, {
      must: [MemberRole.Owner, MemberRole.Maintainer],
    });
    return pubc;
  }
}
