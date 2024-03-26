import { IPublicTypeAssetsJson } from '@alilc/lowcode-types';
import { Field, InputType } from '@nestjs/graphql';

import { IPublicTypeProjectPageSchema } from '@/types';

@InputType()
export class UpdateAppInput {
  /** 应用 id */
  id: string;

  /** 应用名称 */
  name?: string;

  /** 应用描述 */
  description?: string;

  /** 应用资产 */
  @Field(() => JSON, { description: '应用资产', nullable: true })
  assets?: IPublicTypeAssetsJson;

  /** 应用 schema: version, utils, constants, css, config, meta, i18n 等信息 */
  @Field(() => JSON, {
    description: '应用 schema: version, utils, constants, css, config, meta, i18n 等信息',
    nullable: true,
  })
  schema?: IPublicTypeProjectPageSchema;
}
