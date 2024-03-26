import { IPublicTypeAssetsJson } from '@alilc/lowcode-types';
import { Field, InputType } from '@nestjs/graphql';
import { Matches } from 'class-validator';

import { IPublicTypeProjectPageSchema } from '@/types';

@InputType()
export class NewAppInput {
  /** 应用名称 */
  name: string;

  /** 应用的命名空间 (创建后不可更改) */
  @Matches(/^(?!-)(?!.*\.git$)(?!.*\.atom$)[\w-]+(?:\.[\w-]+)*$/, {
    message: `App namespace can contain only letters, digits, '_', '-' and '.'. Cannot start with '-', end in '.git' or end in '.atom'`,
  })
  namespace: string;

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
