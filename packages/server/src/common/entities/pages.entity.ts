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

import { IPublicTypeProjectPageSchema } from '@/types';

import { App } from './apps.entity';

const tableName = 'pages';

@ObjectType({ description: '页面' })
@Entity({ name: tableName })
export class Page {
  /** 表名 */
  static tableName = tableName;

  /** 页面 id */
  @Field(() => ID, { description: '页面 id' })
  @PrimaryColumn({ length: 16 })
  id: string;

  /** 页面标题 */
  @Column()
  title: string;

  /** 页面路径 */
  @Column()
  pathname: string;

  /** 页面相关包 */
  @Field(() => JSON, {
    description: '页面相关包',
    nullable: true,
    deprecationReason: '已废弃，调整到应用维度维护',
  })
  @Column({ type: 'json', nullable: true })
  packages?: object;

  /** 页面内容 */
  @Field(() => JSON, { description: '页面内容', nullable: true })
  @Column({ type: 'json', nullable: true })
  content?: IPublicTypeProjectPageSchema;

  /** 应用 id */
  @Column({ name: 'app_id', length: 16 })
  appId: string;

  /** 应用 */
  @Field(() => App, { description: '应用', nullable: true })
  @ManyToOne(() => App, app => app.pages)
  @JoinColumn({ name: 'app_id' })
  app: App;

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
