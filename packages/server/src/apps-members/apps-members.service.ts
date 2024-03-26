import { Injectable, Logger } from '@nestjs/common';

import { AppMember } from '@/common/entities/apps-members.entity';
import { App } from '@/common/entities/apps.entity';
import { MemberRole } from '@/common/models/member-role.enum';
import { UserRole } from '@/common/models/user-role.enum';
import treeDataSources from '@/common/tree-data-sources';
import { CustomException, TREE_DEFAULT } from '@/common/utils';
import { GitService } from '@/git/git.service';
import { ILoginUser } from '@/types';

import { AddAppMemberInput } from './dtos/add-app-members.input';

export interface CheckUserAppMemberRoleOptions {
  /** 必须是以下角色才可以 */
  must?: MemberRole[];
  /** 必须不是以下角色才可以 */
  not?: MemberRole[];
}

@Injectable()
export class AppsMembersService {
  constructor(private readonly gitService: GitService) {}

  logger = new Logger('AppsMembersService');

  getAppsMembersRepository = (tree: string) =>
    treeDataSources.getRepository<AppMember>(tree, AppMember);

  async listUserApps(tree: string, userId: string): Promise<App[]> {
    const appsMembersRepository = await this.getAppsMembersRepository(tree);
    const appsMembers = await appsMembersRepository.find({
      where: { userId },
      order: {
        createAt: 'DESC',
      },
      relations: { app: true },
    });
    return appsMembers.map(({ app }) => app);
  }

  async listAppMembers(tree: string, appId: string): Promise<AppMember[]> {
    const appsMembersRepository = await this.getAppsMembersRepository(tree);
    const appsMembers = await appsMembersRepository.find({
      where: { appId },
      order: {
        createAt: 'DESC',
      },
      relations: { member: true },
    });
    return appsMembers;
  }

  async checkUserAppMemberRole(
    user: ILoginUser,
    appId: string,
    options?: CheckUserAppMemberRoleOptions
  ) {
    if (user.role === UserRole.SystemAdmin) {
      return MemberRole.Owner;
    }
    const appsMembersRepository = await this.getAppsMembersRepository(TREE_DEFAULT);
    const appMember = await appsMembersRepository.findOneBy({
      userId: user.id,
      appId,
    });
    if (!appMember) {
      throw new CustomException('Forbidden', `You do not have permission for app ${appId}`, 403, {
        name: appId,
        kind: App.name,
      });
    }
    if (
      (options?.must && !options.must.includes(appMember.role)) ||
      options?.not?.includes(appMember.role)
    ) {
      throw new CustomException(
        'Forbidden',
        `You do not have some permission for app ${appId}, because your role is ${appMember.role}`,
        403,
        {
          name: appId,
          kind: App.name,
        }
      );
    }
    return appMember.role;
  }

  async addAppMember(tree: string, loginUser: ILoginUser, body: AddAppMemberInput) {
    const { appId, userId, role } = body;
    await this.checkUserAppMemberRole(loginUser, appId, {
      must: [MemberRole.Owner, MemberRole.Maintainer],
    });
    const appsMembersRepository = await this.getAppsMembersRepository(tree);
    const currentAppMember = await appsMembersRepository.findOneBy({
      appId,
      userId,
    });
    if (currentAppMember?.role === role) {
      return currentAppMember;
    }
    if (loginUser.role !== UserRole.SystemAdmin) {
      if (role === MemberRole.Owner) {
        throw new CustomException('Forbidden', 'can not add a owner member', 403, body);
      }
      if (
        currentAppMember?.role === MemberRole.Owner ||
        currentAppMember?.role === MemberRole.Maintainer
      ) {
        throw new CustomException(
          'Forbidden',
          'can not reset a owner/maintainer member',
          403,
          body
        );
      }
    }

    const dataSource = await treeDataSources.getDataSource(tree);
    const queryRunner = dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const appMember = new AppMember();
      appMember.role = role;
      appMember.userId = userId;
      appMember.appId = appId;
      await appsMembersRepository.save(appMember);
      await this.gitService.commitNt(tree, {
        committer: loginUser,
        tables: [AppMember.tableName],
        message: `Add memeber ${userId} as ${role} into app ${appId}`,
      });
      // 为应用成员 (Developer/Maintainer/Owner) 创建默认开发分支
      try {
        if (
          role === MemberRole.Developer ||
          role === MemberRole.Maintainer ||
          role === MemberRole.Owner
        ) {
          await this.gitService.DOLT_BRANCH(
            ['-c', `${appId}/${TREE_DEFAULT}`, `${appId}/${userId}/dev`],
            queryRunner
          );
        }
      } catch (error) {
        this.logger.warn(
          `Checkout dev branch failed, when add memeber ${userId} into app ${appId}`,
          error
        );
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      // since we have errors lets rollback the changes we made
      this.logger.error('addAppMember failed', error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }

    return appsMembersRepository.findOneBy({ appId, userId });
  }

  async removeAppMember(tree: string, loginUser: ILoginUser, appId: string, userId: string) {
    const currentUserInAppRole = await this.checkUserAppMemberRole(loginUser, appId, {
      must: [MemberRole.Owner, MemberRole.Maintainer],
    });
    const appsMembersRepository = await this.getAppsMembersRepository(tree);
    const currentAppMember = await appsMembersRepository.findOneBy({
      appId,
      userId,
    });
    if (!currentAppMember) {
      return true;
    }
    if (loginUser.role !== UserRole.SystemAdmin) {
      if (currentAppMember.role === MemberRole.Owner) {
        throw new CustomException('Forbidden', 'can not remove a owner member', 403, {
          appId,
          userId,
        });
      }
      if (
        currentAppMember.role === MemberRole.Maintainer &&
        currentUserInAppRole !== MemberRole.Owner
      ) {
        throw new CustomException(
          'Forbidden',
          'can not remove a maintainer member, because you are not owner',
          403,
          { appId, userId }
        );
      }
    }
    await appsMembersRepository.delete({ appId, userId });
    await this.gitService.commitNt(tree, {
      committer: loginUser,
      tables: [AppMember.tableName],
      message: `Remove memeber ${userId} from app ${appId}`,
    });
    return true;
  }
}
