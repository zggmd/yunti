import { Module } from '@nestjs/common';

import { AppsMembersModule } from '@/apps-members/apps-members.module';
import { ChartmuseumModule } from '@/chartmuseum/chartmuseum.module';
import { GitModule } from '@/git/git.module';

import { PublishChannelsResolver } from './publish-channels.resolver';
import { PublishChannelsService } from './publish-channels.service';

@Module({
  providers: [PublishChannelsService, PublishChannelsResolver],
  exports: [PublishChannelsService],
  imports: [GitModule, AppsMembersModule, ChartmuseumModule],
})
export class PublishChannelsModule {}
