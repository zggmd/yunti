import { Module } from '@nestjs/common';

import { ComponentsMembersModule } from '@/components-members/components-members.module';
import { ComponentsVersionsModule } from '@/components-versions/components-versions.module';
import { GitModule } from '@/git/git.module';

import { ComponentsResolver } from './components.resolver';
import { ComponentsService } from './components.service';

@Module({
  imports: [GitModule, ComponentsMembersModule, ComponentsVersionsModule],
  providers: [ComponentsResolver, ComponentsService],
  exports: [ComponentsService],
})
export class ComponentsModule {}
