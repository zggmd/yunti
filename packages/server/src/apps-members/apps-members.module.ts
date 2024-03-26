import { Module } from '@nestjs/common';

import { GitModule } from '@/git/git.module';

import { AppsMembersResolver } from './apps-members.resolver';
import { AppsMembersService } from './apps-members.service';

@Module({
  imports: [GitModule],
  providers: [AppsMembersService, AppsMembersResolver],
  exports: [AppsMembersService],
})
export class AppsMembersModule {}
