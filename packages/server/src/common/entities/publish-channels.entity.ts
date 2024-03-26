import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { PublishChannelDetail } from '@/publish-channels/models/publish-channel-detail.model';
import { PublishChannelStatus } from '@/publish-channels/models/publish-channel-status.enum';
import { PublishChannelType } from '@/publish-channels/models/publish-channel-type.enum';

import { App } from './apps.entity';
import { PublishRecord } from './publish-records.entity';
import { User } from './users.entity';

const tableName = 'publish_channels';

@ObjectType({ description: '发布渠道' })
@Entity({ name: tableName })
@Unique('UQ_APPID_NAME', ['appId', 'name'])
export class PublishChannel {
  /** 表名 */
  static tableName = tableName;

  /** 渠道 id */
  @Field(() => ID, { description: '渠道 id' })
  @PrimaryColumn({ length: 16 })
  id: string;

  /** 渠道名称 */
  @Index('name-idx')
  @Column()
  name: string;

  /** 应用 id：内置渠道没有该字段 */
  @Column({ name: 'app_id', length: 16, nullable: true })
  appId?: string;

  /** 渠道类型 */
  @Field(() => PublishChannelType, { description: '渠道类型', nullable: true })
  @Index('type-idx')
  @Column({
    type: 'enum',
    enum: PublishChannelType,
    default: PublishChannelType.Helm,
  })
  type: PublishChannelType;

  /** 是否内置渠道*/
  @Column({ name: 'built_in', type: 'bool', default: false })
  @Index('built-in-idx')
  builtIn: boolean;

  /** 渠道状态 */
  @Field(() => PublishChannelStatus, {
    description: '渠道状态',
    nullable: true,
  })
  @Index('status-idx')
  @Column({
    type: 'enum',
    enum: PublishChannelStatus,
    default: PublishChannelStatus.Healthy,
  })
  status: PublishChannelStatus;

  /** 渠道详情 */
  @Field(() => PublishChannelDetail, {
    description: '渠道详情',
    nullable: true,
  })
  @Column({ type: 'json', nullable: true })
  detail: typeof PublishChannelDetail;

  /** 更新者 id */
  @Column({ name: 'updator_id', length: 16, nullable: true })
  updatorId?: string;

  /** 应用发布记录 */
  @Field(() => [PublishRecord], {
    description: '应用发布记录',
    nullable: true,
  })
  @OneToMany(() => PublishRecord, publishRecord => publishRecord.channel)
  publishRecords?: PublishRecord[];

  /** 应用 */
  @Field(() => App, { description: '应用', nullable: true })
  @ManyToOne(() => App, app => app.publishChannels, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'app_id' })
  app?: App;

  /** 更新者 */
  @Field(() => User, { description: '更新者', nullable: true })
  @ManyToOne(() => User, user => user.publishChannels, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'updator_id' })
  updator?: User;

  /** 创建时间 */
  @CreateDateColumn({ name: 'create_at' })
  createAt?: number;

  /** 更新时间 */
  @UpdateDateColumn({ name: 'update_at' })
  updateAt?: number;
}
