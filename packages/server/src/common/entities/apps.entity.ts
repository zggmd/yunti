import { IPublicTypeAssetsJson } from '@alilc/lowcode-types';
import { Field, HideField, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { IPublicTypeProjectPageSchema } from '@/types';

import { DefaultModel } from '../models/default.model';
import { AppMember } from './apps-members.entity';
import { Branch } from './git/branches.entity';
import { Tag } from './git/tags.entity';
import { Page } from './pages.entity';
import { PublishChannel } from './publish-channels.entity';
import { PaginatedPublishRecords, PublishRecord } from './publish-records.entity';

export interface I18nUsage {
  [i18key: string]: {
    [pageId: string]: string[][];
  };
}

const tableName = 'apps';

@ObjectType({ description: '应用' })
@Entity({ name: tableName })
export class App extends DefaultModel {
  /** 表名 */
  static tableName = tableName;

  /** 应用 id */
  @Field(() => ID, { description: '应用 id' })
  @PrimaryColumn({ length: 16 })
  id: string;

  /** 应用名称 */
  @Column({ unique: true })
  name: string;

  /** 应用描述 */
  @Column({ nullable: true })
  description?: string;

  /** 应用资产 */
  @Field(() => JSON, { description: '应用资产', nullable: true })
  @Column({ type: 'json', nullable: true })
  assets?: IPublicTypeAssetsJson;

  /** 应用 schema: version, utils, constants, css, config, meta, i18n 等信息 */
  @Field(() => JSON, {
    description: '应用 schema: version, utils, constants, css, config, meta, i18n 等信息',
    nullable: true,
  })
  @Column({ type: 'json', nullable: true })
  schema?: IPublicTypeProjectPageSchema;

  /** 包含页面的完整 schema，一般用于出码 */
  @Field(() => JSON, {
    description: '包含页面的完整 schema，一般用于出码',
    nullable: true,
  })
  fullSchema?: IPublicTypeProjectPageSchema;

  /** 应用国际化文案使用情况 */
  @Field(() => JSON, {
    description: '应用国际化文案使用情况',
    nullable: true,
  })
  i18nUsage?: I18nUsage;

  /** 应用成员 */
  @Field(() => [AppMember], { description: '应用成员', nullable: true })
  @OneToMany(() => AppMember, appMembers => appMembers.app)
  members?: AppMember[];

  /** 应用页面 */
  @Field(() => [Page], { description: '应用页面', nullable: true })
  @OneToMany(() => Page, page => page.app)
  pages?: Page[];

  @Field(() => [Branch], { description: '分支列表' })
  branches?: Branch[];

  @Field(() => [Tag], { description: '标签列表' })
  tags?: Tag[];

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

  /** 应用发布记录 */
  @Field(() => PaginatedPublishRecords, {
    description: '分页的应用发布记录',
    nullable: true,
  })
  paginatedPublishRecords?: PaginatedPublishRecords;

  /** 创建时间 */
  @CreateDateColumn({ name: 'create_at' })
  createAt?: number;

  /** 创建时间 */
  @UpdateDateColumn({ name: 'update_at' })
  updateAt?: number;

  /** 应用的当前分支、版本 或 提交 ID */
  @HideField()
  tree?: string;
}
