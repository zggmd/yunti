import { IPublicTypeAssetsJson } from '@alilc/lowcode-types';
import { Field, InputType } from '@nestjs/graphql';

import { IPublicTypeProjectComponentSchema } from '@/types';

@InputType()
export class UpdateComponentInput {
  /** 组件 id */
  id: string;

  /** 组件名称 */
  name?: string;

  /** 文件名 */
  fileName?: string;

  /** 组件描述 */
  description?: string;

  /** 组件资产 */
  @Field(() => JSON, { description: '组件资产', nullable: true })
  assets?: IPublicTypeAssetsJson;

  /** 组件 schema: version, utils, constants, css, config, meta, i18n 等信息 */
  @Field(() => JSON, {
    description: '组件 schema: version, utils, constants, css, config, meta, i18n 等信息',
    nullable: true,
  })
  schema?: IPublicTypeProjectComponentSchema;
}
