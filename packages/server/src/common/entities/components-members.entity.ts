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
import { Component } from './components.entity';
import { User } from './users.entity';

const tableName = 'components_members';

@ObjectType({ description: '组件成员' })
@Entity({ name: tableName })
export class ComponentMember {
  /** 表名 */
  static tableName = tableName;

  /** 组件 id */
  @PrimaryColumn({ name: 'component_id', length: 16 })
  componentId: string;

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

  /** 组件 */
  @Field(() => Component, { description: '组件', nullable: true })
  @ManyToOne(() => Component, component => component.members)
  @JoinColumn({ name: 'component_id' })
  component?: Component;

  /** 成员 */
  @Field(() => User, { description: '成员', nullable: true })
  @ManyToOne(() => User, user => user.components)
  @JoinColumn({ name: 'user_id' })
  member?: User;

  /** 创建时间 */
  @CreateDateColumn({ name: 'create_at' })
  createAt?: number;

  /** 更新时间 */
  @UpdateDateColumn({ name: 'update_at' })
  updateAt?: number;
}
