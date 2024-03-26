import { Module } from '@nestjs/common';

import { GitResolver } from './git.resolver';
import { GitService } from './git.service';

@Module({
  providers: [GitService, GitResolver],
  exports: [GitService],
})
export class GitModule {}
