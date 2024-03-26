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

import { Component } from './components.entity';

const tableName = 'components_versions';

@ObjectType({ description: '组件版本' })
@Entity({ name: tableName })
export class ComponentVersion {
  /** 表名 */
  static tableName = tableName;

  /** 组件 id */
  @PrimaryColumn({ name: 'component_id', length: 16 })
  componentId: string;

  /** 版本 */
  @PrimaryColumn()
  version: string;

  /** 版本对应的提交 id */
  @Column({ name: 'commit_id' })
  commitId: string;

  /** 版本描述 */
  @Column({ nullable: true })
  description?: string;

  /** 组件 */
  @Field(() => Component, { description: '组件', nullable: true })
  @ManyToOne(() => Component, component => component.versions)
  @JoinColumn({ name: 'component_id' })
  component?: Component;

  /** 创建时间 */
  @CreateDateColumn({ name: 'create_at' })
  createAt?: number;

  /** 更新时间 */
  @UpdateDateColumn({ name: 'update_at' })
  updateAt?: number;
}
