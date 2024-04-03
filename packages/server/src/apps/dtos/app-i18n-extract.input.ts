import { InputType } from '@nestjs/graphql';

@InputType()
export class AppI18nExtractInput {
  /** 应用 ID */
  appId: string;

  /** 需要提取国际化文案的分支名 */
  branch: string;
}
