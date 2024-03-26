import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@ObjectType({ description: '标签' })
@Entity({ name: 'dolt_tags', synchronize: false })
export class Tag {
  /** 标签名 */
  @Field(() => ID, { description: '标签名' })
  @PrimaryColumn({ type: 'text', name: 'tag_name' })
  name: string;

  /** 提交 id */
  @PrimaryColumn({ type: 'text', name: 'tag_hash' })
  hash: string;

  /** 提交人 */
  @Column({ type: 'text' })
  tagger: string;

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
