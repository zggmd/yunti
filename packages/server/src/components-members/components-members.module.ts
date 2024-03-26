import { Module } from '@nestjs/common';

import { ComponentsMembersService } from './components-members.service';

@Module({
  providers: [ComponentsMembersService],
  exports: [ComponentsMembersService],
})
export class ComponentsMembersModule {}
