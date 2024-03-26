import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppsMembersModule } from '@/apps-members/apps-members.module';
import { AppsModule } from '@/apps/apps.module';
import { User } from '@/common/entities/users.entity';
import { ComponentsMembersModule } from '@/components-members/components-members.module';
import { ComponentsModule } from '@/components/components.module';
import { GitModule } from '@/git/git.module';

import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    AppsModule,
    AppsMembersModule,
    ComponentsModule,
    ComponentsMembersModule,
    GitModule,
  ],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}
