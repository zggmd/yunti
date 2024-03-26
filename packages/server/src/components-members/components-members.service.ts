import { Injectable, Logger } from '@nestjs/common';

import { ComponentMember } from '@/common/entities/components-members.entity';
import { Component } from '@/common/entities/components.entity';
import { MemberRole } from '@/common/models/member-role.enum';
import { UserRole } from '@/common/models/user-role.enum';
import treeDataSources from '@/common/tree-data-sources';
import { CustomException, TREE_DEFAULT } from '@/common/utils';
import { ILoginUser } from '@/types';

export interface CheckUserComponentMemberRoleOptions {
  /** 必须是以下角色才可以 */
  must?: MemberRole[];
  /** 必须不是以下角色才可以 */
  not?: MemberRole[];
}

@Injectable()
export class ComponentsMembersService {
  logger = new Logger('ComponentsMembersService');

  getComponentsMembersRepository = (tree: string) =>
    treeDataSources.getRepository<ComponentMember>(tree, ComponentMember);

  async listUserComponents(tree: string, userId: string): Promise<Component[]> {
    const componentsMembersRepository = await this.getComponentsMembersRepository(tree);
    const componentsMembers = await componentsMembersRepository.find({
      where: { userId },
      order: {
        createAt: 'DESC',
      },
      relations: { component: true },
    });
    return componentsMembers.map(({ component }) => component);
  }

  async listComponentMembers(tree: string, componentId: string): Promise<ComponentMember[]> {
    const componentsMembersRepository = await this.getComponentsMembersRepository(tree);
    const componentsMembers = await componentsMembersRepository.find({
      where: { componentId },
      order: {
        createAt: 'DESC',
      },
      relations: { member: true },
    });
    return componentsMembers;
  }

  async checkUserComponentMemberRole(
    user: ILoginUser,
    componentId: string,
    options?: CheckUserComponentMemberRoleOptions
  ) {
    if (user.role === UserRole.SystemAdmin) {
      return MemberRole.Owner;
    }
    const componentsMembersRepository = await this.getComponentsMembersRepository(TREE_DEFAULT);
    const componentMember = await componentsMembersRepository.findOneBy({
      userId: user.id,
      componentId,
    });
    if (!componentMember) {
      throw new CustomException(
        'Forbidden',
        `You do not have permission for component ${componentId}`,
        403,
        {
          name: componentId,
          kind: Component.name,
        }
      );
    }
    if (
      (options?.must && !options.must.includes(componentMember.role)) ||
      options?.not?.includes(componentMember.role)
    ) {
      throw new CustomException(
        'Forbidden',
        `You do not have some permission for component ${componentId}, because your role is ${componentMember.role}`,
        403,
        {
          name: componentId,
          kind: Component.name,
        }
      );
    }
    return componentMember.role;
  }
}
