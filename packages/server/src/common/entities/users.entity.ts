import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UserRole } from '@/common/models/user-role.enum';

import { App } from './apps.entity';
import { Block } from './blocks.entity';
import { Component } from './components.entity';
import { PublishChannel } from './publish-channels.entity';
import { PublishRecord } from './publish-records.entity';

const tableName = 'users';

@ObjectType({ description: '用户' })
@Entity({ name: tableName })
export class User {
  /** 表名 */
  static tableName = tableName;

  /** 用户 id */
  @Field(() => ID, { description: '用户 id' })
  @PrimaryColumn({ length: 16 })
  id: string;

  /** 用户名称 */
  @Column({ unique: true })
  name: string;

  /** 用户邮箱 */
  @Column({ unique: true })
  email: string;

  /** 用户角色 */
  @Field(() => UserRole, { description: '用户角色', nullable: true })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.User,
  })
  role: UserRole;

  /** 用户的应用 */
  @Field(() => [App], { description: '用户的应用', nullable: true })
  @OneToMany(() => App, app => app.members)
  apps?: App[];

  /** 用户的区块 */
  @Field(() => [Block], { description: '用户的区块', nullable: true })
  @OneToMany(() => Block, block => block.creator)
  blocks?: Block[];

  /** 用户的组件 */
  @Field(() => [Component], { description: '用户的组件', nullable: true })
  @OneToMany(() => Component, component => component.members)
  components?: Component[];

  /** 应用发布渠道 */
  @Field(() => [PublishChannel], {
    description: '应用发布渠道',
    nullable: true,
  })
  @OneToMany(() => PublishChannel, publishChannel => publishChannel.app)
  publishChannels?: PublishChannel[];

  /** 应用发布记录 */
  @Field(() => [PublishRecord], {
    description: '应用发布记录',
    nullable: true,
  })
  @OneToMany(() => PublishRecord, publishRecord => publishRecord.app)
  publishRecords?: PublishRecord[];

  /** 创建时间 */
  @CreateDateColumn({ name: 'create_at' })
  createAt?: number;

  /** 更新时间 */
  @UpdateDateColumn({ name: 'update_at' })
  updateAt?: number;
}
