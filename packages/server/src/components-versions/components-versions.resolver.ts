import { Args, Query, Resolver } from '@nestjs/graphql';

import { LoginUser } from '@/common/decorators/login-user.decorator';
import { Tree } from '@/common/decorators/tree.decorator';
import { ComponentVersion } from '@/common/entities/components-versions.entity';
import { ILoginUser } from '@/types';

import { ComponentsVersionsService } from './components-versions.service';

@Resolver(() => ComponentVersion)
export class ComponentsVersionsResolver {
  constructor(private readonly componentsVersionsService: ComponentsVersionsService) {}

  @Query(() => ComponentVersion, { description: '组件版本', nullable: true })
  async componentVersion(
    @Tree() tree: string,
    @LoginUser() user: ILoginUser,
    @Args('componentId') componentId: string,
    @Args('version') version: string
  ): Promise<ComponentVersion> {
    return this.componentsVersionsService.getComponentVersionDetail(tree, componentId, version);
  }
}
