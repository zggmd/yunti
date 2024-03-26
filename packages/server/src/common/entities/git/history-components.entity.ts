import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { Commit } from './commits.entity';

@ObjectType({ description: '历史组件' })
@Entity({ name: 'dolt_history_components', synchronize: false })
export class HistoryComponent {
  /** 组件 id */
  @Field(() => ID, { description: '组件 id' })
  @PrimaryColumn({ length: 16 })
  id: string;

  /** 组件名称 */
  @Column()
  name: string;

  /** 组件描述 */
  @Column()
  description?: string;

  /** 应用 id */
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
