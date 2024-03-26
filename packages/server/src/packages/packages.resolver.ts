import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { LoginUser } from '@/common/decorators/login-user.decorator';
import { ILoginUser } from '@/types';

import { Package, PackageUmdConfig } from './models/package.model';
import { PackagesService } from './packages.service';

@Resolver(() => Package)
export class PackagesResolver {
  constructor(private readonly packagesService: PackagesService) {}

  @Query(() => [Package], { description: 'npm 包列表' })
  async packages(@Args('keyword', { nullable: true }) keyword: string): Promise<Package[]> {
    return this.packagesService.query(keyword);
  }

  @Query(() => Package, { description: 'npm 包详情', nullable: true })
  async package(
    @Args('name') name: string,
    @Args('version', { nullable: true }) version: string
  ): Promise<Package> {
    return this.packagesService.getPackageDetail(name, version);
  }

  @ResolveField(() => PackageUmdConfig, { description: 'npm 包 umd 配置' })
  async umd(
    @Parent() npm: Package,
    @LoginUser() loginUser: ILoginUser,
    @Args('tree', { nullable: true }) tree: string,
    @Args('id', { nullable: true, description: '应用或组件的 id' }) id: string
  ): Promise<PackageUmdConfig> {
    return this.packagesService.getUmdConfig(npm, loginUser, tree, id);
  }
}
