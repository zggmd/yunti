import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { PublishBaseline } from '@/publish-records/models/publish-baseline.enum';
import { PublishRecordDetail } from '@/publish-records/models/publish-record.model';
import { PublishStatus } from '@/publish-records/models/publish-status.enum';

import { Paginated } from '../models/paginated.function';
import { App } from './apps.entity';
import { PublishChannel } from './publish-channels.entity';
import { User } from './users.entity';

const tableName = 'publish_records';

@ObjectType({ description: '发布记录' })
@Entity({ name: tableName })
export class PublishRecord {
  /** 表名 */
  static tableName = tableName;

  /** 发布 id */
  @Field(() => ID, { description: '发布 id' })
  @PrimaryColumn({ length: 16 })
  id: string;

  /** 构建 id：一般对应的是构建流水线的 name */
  @Column({ name: 'build_id', unique: true })
  buildId: string;

  /** 应用 id */
  @Column({ name: 'app_id', length: 16 })
  appId: string;

  /** 渠道 id */
  @Column({ name: 'channel_id', length: 16, nullable: true })
  channelId?: string;

  /** 渠道名称 */
  @Index('channel-name-idx')
  @Column({ name: 'channel_name', length: 16 })
  channelName: string;

  /** 发布名称 */
  @Column()
  @Index('name-idx')
  name: string;

  /** 发布基线 */
  @Field(() => PublishBaseline, {
    description: '发布基线',
  })
  @Index('baseline-idx')
  @Column()
  baseline: PublishBaseline;

  /** 分支名、标签名 或 提交 ID */
  @Column()
  tree: string;

  /** 发布版本 */
  @Column()
  @Index('version-idx')
  version: string;

  /** 发布状态 */
  @Field(() => PublishStatus, {
    description: '发布状态',
    nullable: true,
  })
  @Index('status-idx')
  @Column({
    type: 'enum',
    enum: PublishStatus,
    default: PublishStatus.Running,
  })
  status?: PublishStatus;

  /** 发布记录详情 */
  @Field(() => PublishRecordDetail, {
    description: '发布详情',
    nullable: true,
  })
  @Column({ type: 'json', nullable: true })
  detail: PublishRecordDetail;

  /** 发布者 id */
  @Column({ name: 'publisher_id', length: 16, nullable: true })
  publisherId?: string;

  /** 渠道 */
  @Field(() => PublishChannel, { description: '渠道', nullable: true })
  @ManyToOne(() => PublishChannel, channel => channel.publishRecords, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'channel_id' })
  channel?: PublishChannel;

  /** 应用 */
  @Field(() => App, { description: '应用', nullable: true })
  @ManyToOne(() => App, app => app.publishRecords, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'app_id' })
  app?: App;

  /** 更新者 */
  @Field(() => User, { description: '更新者', nullable: true })
  @ManyToOne(() => User, user => user.publishRecords, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'publisher_id' })
  publisher?: User;

  /** 创建时间 */
  @CreateDateColumn({ name: 'create_at' })
  createAt?: number;

  /** 更新时间 */
  @UpdateDateColumn({ name: 'update_at' })
  updateAt?: number;
}

@ObjectType({ description: '分页的发布记录' })
export class PaginatedPublishRecords extends Paginated(PublishRecord) {}
