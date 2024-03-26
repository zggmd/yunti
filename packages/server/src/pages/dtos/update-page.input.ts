import { Directive, Field, InputType } from '@nestjs/graphql';

import { IPublicTypeProjectPageSchema } from '@/types';

@InputType()
export class UpdatePageInput {
  /** 页面 id */
  id: string;

  /** 页面标题 */
  title?: string;

  /** 页面路径 */
  pathname?: string;

  /** 文件名 */
  fileName?: string;

  /** 页面相关包 */
  @Directive('@deprecated(reason: "已废弃，调整到应用维度维护")')
  @Field(() => JSON, { description: '页面相关包', nullable: true })
  packages?: object;

  /** 页面内容 */
  @Field(() => JSON, { description: '页面内容', nullable: true })
  content?: IPublicTypeProjectPageSchema;
}
