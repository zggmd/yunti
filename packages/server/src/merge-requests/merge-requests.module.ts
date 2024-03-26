import { Module } from '@nestjs/common';

import { AppsMembersModule } from '@/apps-members/apps-members.module';
import { ComponentsMembersModule } from '@/components-members/components-members.module';
import { GitModule } from '@/git/git.module';

import { MergeRequestResolver } from './merge-requests.resolver';
import { MergeRequestService } from './merge-requests.service';

@Module({
  imports: [AppsMembersModule, GitModule, ComponentsMembersModule],
  providers: [MergeRequestService, MergeRequestResolver],
  exports: [MergeRequestService],
})
export class MergeRequestModule {}
