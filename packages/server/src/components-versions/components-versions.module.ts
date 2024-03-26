import { Module } from '@nestjs/common';

import { ComponentsVersionsResolver } from './components-versions.resolver';
import { ComponentsVersionsService } from './components-versions.service';

@Module({
  providers: [ComponentsVersionsService, ComponentsVersionsResolver],
  exports: [ComponentsVersionsService],
})
export class ComponentsVersionsModule {}
