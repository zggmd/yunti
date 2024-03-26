import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryColumn } from 'typeorm';

import { Paginated } from '@/common/models/paginated.function';

@ObjectType({ description: '提交日志' })
@Entity({ name: 'dolt_log', synchronize: false })
export class Log {
  /** 提交 id */
  @Field(() => ID, { description: '提交 id' })
  @PrimaryColumn({ name: 'commit_hash', type: 'text' })
  hash: string;

  /** 提交人 */
  @Column({ type: 'text' })
  committer: string;

  /** 提交人邮箱 */
  @Column({ type: 'text' })
  email: string;

  /** 提交日期 */
  @Column({ type: 'datetime' })
  date: number;

  /** 提交信息 */
  @Column({ type: 'text' })
  message: string;
}

@ObjectType({ description: '分页的提交日志' })
export class PaginatedLog extends Paginated(Log) {}
