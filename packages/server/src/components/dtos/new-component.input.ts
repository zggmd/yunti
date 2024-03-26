import { IPublicTypeAssetsJson } from '@alilc/lowcode-types';
import { Field, InputType } from '@nestjs/graphql';
import { Matches } from 'class-validator';

import { IPublicTypeProjectComponentSchema } from '@/types';

@InputType()
export class NewComponentInput {
  /** 组件名称 */
  name: string;

  /** 组件的命名空间 (创建后不可更改) */
  @Matches(/^(?!-)(?!.*\.git$)(?!.*\.atom$)[\w-]+(?:\.[\w-]+)*$/, {
    message: `Component namespace can contain only letters, digits, '_', '-' and '.'. Cannot start with '-', end in '.git' or end in '.atom'`,
  })
  namespace: string;

  /** 文件名 */
  fileName: string;

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
