/**
 * 分支
 *
 * dolt 内置的所有表：
 * https://docs.dolthub.com/sql-reference/version-control/dolt-system-tables
 */
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@ObjectType({ description: '分支' })
@Entity({ name: 'dolt_branches', synchronize: false })
export class Branch {
  /** 分支名 */
  @Field(() => ID, { description: '分支名' })
  @PrimaryColumn({ type: 'text' })
  name: string;

  /** 分支展示名 */
  displayName?: string;

  /** 提交 id */
  @Column({ type: 'text' })
  hash: string;

  /** 提交人 */
  @Column({ type: 'text', name: 'latest_committer' })
  committer: string;

  /** 提交人邮箱 */
  @Column({ type: 'text', name: 'latest_committer_email' })
  email: string;

  /** 提交日期 */
  @Column({ type: 'datetime', name: 'latest_commit_date' })
  date: number;

  /** 提交信息 */
  @Column({ type: 'text', name: 'latest_commit_message' })
  message: string;
}
