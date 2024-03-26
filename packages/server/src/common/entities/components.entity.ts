import { IPublicTypeAssetsJson } from '@alilc/lowcode-types';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { IPublicTypeProjectComponentSchema } from '@/types';

import { DefaultModel } from '../models/default.model';
import { ComponentMember } from './components-members.entity';
import { ComponentVersion } from './components-versions.entity';

export interface I18nUsage {
  [i18key: string]: string[][];
}

const tableName = 'components';

@ObjectType({ description: '组件' })
@Entity({ name: tableName })
export class Component extends DefaultModel {
  /** 表名 */
  static tableName = tableName;

  /** 组件 id */
  @Field(() => ID, { description: '组件 id' })
  @PrimaryColumn({ length: 16 })
  id: string;

  /** 组件名称 */
  @Column({ unique: true })
  name: string;

  /** 组件描述 */
  @Column({ nullable: true })
  description?: string;

  /** 组件资产 */
  @Field(() => JSON, { description: '组件资产', nullable: true })
  @Column({ type: 'json', nullable: true })
  assets?: IPublicTypeAssetsJson;

  /** 组件 schema: version, utils, constants, css, config, meta, i18n 等信息 */
  @Field(() => JSON, {
    description: '组件 schema: version, utils, constants, css, config, meta, i18n 等信息',
    nullable: true,
  })
  @Column({ type: 'json', nullable: true })
  schema?: IPublicTypeProjectComponentSchema;

  /** 组件国际化文案使用情况 */
  @Field(() => JSON, {
    description: '组件国际化文案使用情况',
    nullable: true,
  })
  i18nUsage?: I18nUsage;

  /** 组件成员 */
  @Field(() => [ComponentMember], { description: '组件成员', nullable: true })
  @OneToMany(() => ComponentMember, componentMembers => componentMembers.component)
  members?: ComponentMember[];

  /** 组件版本 */
  @Field(() => [ComponentVersion], { description: '组件版本', nullable: true })
  @OneToMany(() => ComponentVersion, componentVersion => componentVersion.component)
  versions?: ComponentVersion[];

  /** 创建时间 */
  @CreateDateColumn({ name: 'create_at' })
  createAt?: number;

  /** 创建时间 */
  @UpdateDateColumn({ name: 'update_at' })
  updateAt?: number;
}
