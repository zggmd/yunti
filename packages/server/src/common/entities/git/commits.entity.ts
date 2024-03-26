import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryColumn } from 'typeorm';

import { Paginated } from '@/common/models/paginated.function';

const tableName = 'dolt_commits';

@ObjectType({ description: '提交' })
@Entity({ name: 'dolt_commits', synchronize: false })
export class Commit {
  /** 表名 */
  static tableName = tableName;

  /** 提交 id */
  @Field(() => ID, { description: '提交 id', nullable: true })
  @PrimaryColumn({ name: 'commit_hash', type: 'text' })
  hash: string;

  /** 提交人 */
  @Column({ type: 'text' })
  committer: string;

  /** 提交人邮箱 */
  @Column({ type: 'text', nullable: true })
  email?: string;

  /** 提交日期 */
  @Column({ type: 'datetime' })
  date: number;

  /** 提交信息 */
  @Column({ type: 'text' })
  message: string;
}

@ObjectType({ description: '分页的提交' })
export class PaginatedCommits extends Paginated(Commit) {}
