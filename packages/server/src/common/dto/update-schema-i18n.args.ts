import { IPublicTypeI18nMap } from '@alilc/lowcode-types';
import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class UpdateSchemaI18nArgs {
  /** schema id */
  id: string;

  /** schema 的国际化文案 */
  @Field(() => JSON, { description: 'schema 的国际化文案' })
  i18n: IPublicTypeI18nMap;
}
