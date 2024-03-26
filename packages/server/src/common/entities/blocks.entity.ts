import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

import { IPublicTypeProjectBlockSchema } from '@/types';

import { User } from './users.entity';

const tableName = 'blocks';

@ObjectType({ description: '区块' })
@Entity({ name: tableName })
export class Block {
  /** 表名 */
  static tableName = tableName;

  /** 区块 id */
  @Field(() => ID, { description: '区块 id' })
  @PrimaryColumn({ length: 16 })
  id: string;

  /** 区块名称（英文） */
  @Column({ unique: true })
  name: string;

  /** 区块标题（中文）*/
  @Column({ unique: true })
  title: string;

  /** 区块相关包 */
  @Field(() => JSON, { description: '区块相关包', nullable: true })
  @Column({ type: 'json', nullable: true })
  packages?: object;

  /** 区块内容 */
  @Field(() => JSON, { description: '区块内容' })
  @Column({ type: 'json' })
  schema: IPublicTypeProjectBlockSchema;

  /** 区块截图 */
  @Column({ type: 'text' })
  screenshot: string;

  /** 创建者 id */
  @Column({ name: 'creator_id', length: 16 })
  creatorId: string;

  /** 创建者 */
  @Field(() => User, { description: '创建者', nullable: true })
  @ManyToOne(() => User, user => user.blocks)
  @JoinColumn({ name: 'creator_id' })
  creator?: User;

  /** 创建时间 */
  @CreateDateColumn({ name: 'create_at' })
  createAt: number;

  /** 创建时间 */
  @UpdateDateColumn({ name: 'update_at' })
  updateAt: number;

  /** 版本 */
  @VersionColumn()
  version: number;
}
