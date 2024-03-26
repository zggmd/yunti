import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { Paginated } from '@/common/models/paginated.function';

import { Commit } from './commits.entity';

@ObjectType({ description: '历史页面' })
@Entity({ name: 'dolt_history_pages', synchronize: false })
export class HistoryPage {
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

  /** 应用 id */
  @Column({ name: 'app_id' })
  appId: string;

  /** 提交 id */
  @PrimaryColumn({ name: 'commit_hash' })
  hash: string;

  /** 提交日期 */
  @Column({ type: 'datetime', name: 'commit_date' })
  commitDate: number;

  /** 提交 */
  @Field(() => Commit, { description: '提交', nullable: true })
  @ManyToOne(() => Commit)
  @JoinColumn({ name: 'commit_hash' })
  commit: Commit;
}

@ObjectType({ description: '分页的历史页面' })
export class PaginatedHistoryPages extends Paginated(HistoryPage) {}
