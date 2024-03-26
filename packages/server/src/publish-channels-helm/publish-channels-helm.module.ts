import { Module } from '@nestjs/common';

import { ChartmuseumModule } from '@/chartmuseum/chartmuseum.module';

import { PublishChannelsHelmResolver } from './publish-channels-helm.resolver';

@Module({
  providers: [PublishChannelsHelmResolver],
  imports: [ChartmuseumModule],
})
export class PublishChannelsHelmModule {}
