import { Args, Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { ChartmuseumService } from '@/chartmuseum/chartmuseum.service';
import { Chartmuseum } from '@/chartmuseum/models/chartmuseum.model';

import { PublishChannelHelm } from './models/publish-channel-helm.model';

@Resolver(() => PublishChannelHelm)
export class PublishChannelsHelmResolver {
  constructor(private readonly chartmuseumService: ChartmuseumService) {}

  @ResolveField(() => Chartmuseum, {
    nullable: true,
    description: '一个 chart 版本',
  })
  async chart(
    @Parent() helm: PublishChannelHelm,
    @Args('name') name: string,
    @Args('version') version: string
  ): Promise<Chartmuseum> {
    try {
      const chartVersion = await this.chartmuseumService.getChartOneVersion(helm, name, version);
      return chartVersion;
    } catch {
      return null;
    }
  }
}
