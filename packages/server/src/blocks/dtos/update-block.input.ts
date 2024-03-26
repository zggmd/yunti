import { Field, InputType } from '@nestjs/graphql';

import { IPublicTypeProjectBlockSchema } from '@/types';

@InputType()
export class UpdateBlockInput {
  /** 区块 id */
  id: string;

  /** 区块名称（英文） */
  name?: string;

  /** 区块标题（中文）*/
  title?: string;

  /** 区块相关包 */
  @Field(() => JSON, { description: '区块相关包', nullable: true })
  packages?: object;

  /** 区块内容 */
  @Field(() => JSON, { description: '区块内容' })
  schema?: IPublicTypeProjectBlockSchema;

  /** 区块截图 */
  screenshot?: string;
}
