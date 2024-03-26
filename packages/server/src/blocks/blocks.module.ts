import { Module } from '@nestjs/common';

import { GitModule } from '@/git/git.module';

import { BlocksResolver } from './blocks.resolver';
import { BlocksService } from './blocks.service';

@Module({
  imports: [GitModule],
  providers: [BlocksService, BlocksResolver],
})
export class BlocksModule {}
