import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { MemberRole } from '../models/member-role.enum';
import { App } from './apps.entity';
import { User } from './users.entity';

const tableName = 'apps_members';

@ObjectType({ description: '应用成员' })
@Entity({ name: tableName })
export class AppMember {
  /** 表名 */
  static tableName = tableName;

  /** 应用 id */
  @PrimaryColumn({ name: 'app_id', length: 16 })
  appId: string;

  /** 用户 id */
  @PrimaryColumn({ name: 'user_id', length: 16 })
  userId: string;

  /** 角色 */
  @Field(() => MemberRole, { description: '成员角色', nullable: true })
  @Column({
    type: 'enum',
    enum: MemberRole,
    default: MemberRole.Guest,
  })
  role: MemberRole;

  /** 应用 */
  @Field(() => App, { description: '应用', nullable: true })
  @ManyToOne(() => App, app => app.members)
  @JoinColumn({ name: 'app_id' })
  app?: App;

  /** 成员 */
  @Field(() => User, { description: '成员', nullable: true })
  @ManyToOne(() => User, user => user.apps)
  @JoinColumn({ name: 'user_id' })
  member?: User;

  /** 创建时间 */
  @CreateDateColumn({ name: 'create_at' })
  createAt?: number;

  /** 更新时间 */
  @UpdateDateColumn({ name: 'update_at' })
  updateAt?: number;
}
