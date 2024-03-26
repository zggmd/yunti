import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { Paginated } from '@/common/models/paginated.function';

import { Commit } from './commits.entity';

@ObjectType({ description: '历史应用' })
@Entity({ name: 'dolt_history_apps', synchronize: false })
export class HistoryApp {
  /** 应用 id */
  @Field(() => ID, { description: '应用 id' })
  @PrimaryColumn({ length: 16 })
  id: string;

  /** 应用名称 */
  @Column()
  name: string;

  /** 应用描述 */
  @Column()
  description: string;

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

@ObjectType({ description: '分页的历史应用' })
export class PaginatedHistoryApps extends Paginated(HistoryApp) {}
