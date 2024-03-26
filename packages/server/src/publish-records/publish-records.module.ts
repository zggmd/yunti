import { Module, forwardRef } from '@nestjs/common';

import { AppsMembersModule } from '@/apps-members/apps-members.module';
import { AppsModule } from '@/apps/apps.module';
import { ChartmuseumModule } from '@/chartmuseum/chartmuseum.module';
import { GitModule } from '@/git/git.module';
import { MinioModule } from '@/minio/minio.module';
import { PipelinesModule } from '@/pipelines/pipelines.module';
import { PublishChannelsModule } from '@/publish-channels/publish-channels.module';

import { PublishRecordsResolver } from './publish-records.resolver';
import { PublishRecordsService } from './publish-records.service';

@Module({
  providers: [PublishRecordsService, PublishRecordsResolver],
  exports: [PublishRecordsService],
  imports: [
    GitModule,
    AppsMembersModule,
    PublishChannelsModule,
    forwardRef(() => AppsModule),
    MinioModule,
    ChartmuseumModule,
    PipelinesModule,
  ],
})
export class PublishRecordsModule {}
