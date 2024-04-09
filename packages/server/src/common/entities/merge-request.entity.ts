import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { MergeRequestSourceType } from '@/common/models/merge-request-source-type.enum';
import { Options } from '@/merge-requests/dto/merge-request.options';

import { MergeRequestStatus } from '../models/merge-request-status.enum';
import { Branch } from './git/branches.entity';
import { User } from './users.entity';

const tableName = 'merge_requests';

@ObjectType({ description: '合并请求' })
@Entity({ name: tableName })
export class MergeRequest {
  /** 表名 */
  static tableName = tableName;

  /** 主键 id */
  @PrimaryGeneratedColumn('increment')
  id: number;

  /** 创建人 id */
  @Column({ name: 'author_id', nullable: false })
  authorId: string;

  /** 创建人 */
  @Field(() => User, { description: '创建人', nullable: true })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'author_id' })
  author?: User;

  /** assignee id */
  @Column({ name: 'assignee_id', nullable: true })
  assigneeId?: string;

  /** assignee */
  @Field(() => User, { description: '经办人', nullable: true })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'assignee_id' })
  assignee?: User;

  /** 最终合并人 id */
  @Column({ name: 'merge_user_id', nullable: true })
  mergeUserId?: string;

  /** 最终合并人 */
  @Field(() => User, { description: '最终合并人', nullable: true })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'merge_user_id' })
  mergeUser?: User;

  /** 更新合并请求内容的用户id */
  @Column({ name: 'updater_id', nullable: true })
  updaterId?: string;

  /** 更新合并请求内容的用户 */
  @Field(() => User, { description: 'MR 修改者', nullable: true })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne(() => User)
  @JoinColumn({ name: 'updater_id' })
  updater?: User;

  @Column({ name: 'source_branch' })
  sourceBranchName: string;

  /** 合并源分支 */
  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'source_branch' })
  sourceBranch?: Branch;

  @Column({ name: 'target_branch' })
  targetBranchName: string;

  /** 目标分支 */
  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'target_branch' })
  targetBranch?: Branch;

  @Column({ name: 'title', length: 200 })
  title: string;

  @Column({ name: 'description', length: 2000, nullable: true })
  description?: string;

  @Field(() => JSON, { description: '合并请求其他属性' })
  @Column({ name: 'options', type: 'json', nullable: true })
  options?: Options;

  /** MR 状态 */
  @Field(() => MergeRequestStatus, { description: 'MR 状态', nullable: false })
  @Column({
    name: 'merge_status',
    type: 'enum',
    enum: MergeRequestStatus,
    default: MergeRequestStatus.Openning,
  })
  mergeRequestStatus: MergeRequestStatus;

  /** 代码来源 */
  @Field(() => MergeRequestSourceType, {
    description: '代码来源：app, 或者 component',
    nullable: false,
  })
  @Column({
    name: 'source_type',
    type: 'enum',
    enum: MergeRequestSourceType,
  })
  mergeRequestSourceType?: MergeRequestSourceType;

  @Column({ name: 'source_object_id', nullable: true })
  mergeRequestSourceId?: string;

  @Column({ name: 'merge_error', nullable: true })
  mergeError?: string;

  @Column({ name: 'merge_commit_sha', nullable: true })
  mergeCommitSha?: string;

  @Column({ name: 'target_commit_sha', nullable: true })
  targetCommitSha?: string;

  @Column({ name: 'conflict_diff_data', nullable: true })
  conflictDiffData?: string;

  @Column({ name: 'conflict_diff_schema', nullable: true })
  conflictDiffSchema?: string;

  /** 创建时间 */
  @CreateDateColumn({ name: 'create_at' })
  createAt?: number;

  /** 更新时间 */
  @UpdateDateColumn({ name: 'update_at' })
  updateAt?: number;
}
