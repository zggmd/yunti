import { Module } from '@nestjs/common';

import { AppsModule } from '@/apps/apps.module';
import { ComponentsModule } from '@/components/components.module';

import { PackagesResolver } from './packages.resolver';
import { PackagesService } from './packages.service';

@Module({
  providers: [PackagesResolver, PackagesService],
  exports: [PackagesService],
  imports: [AppsModule, ComponentsModule],
})
export class PackagesModule {}
