import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@ObjectType({ description: '提交状态' })
@Entity({ name: 'dolt_status', synchronize: false })
export class Status {
  /** 提交 id */
  @Field(() => ID, { description: '表名' })
  @PrimaryColumn({ name: 'table_name', type: 'text' })
  tableName: string;

  /** 是否暂存 */
  @Column({ type: 'tinyint' })
  staged: number;

  /** 状态 */
  @Column({ type: 'text' })
  status: string;
}
