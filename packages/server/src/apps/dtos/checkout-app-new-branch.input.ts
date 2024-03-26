import { InputType } from '@nestjs/graphql';

@InputType()
export class CheckoutAppNewBranch {
  /** 应用 ID */
  appId: string;

  /** 新分支名称 */
  name: string;

  /** 源分支名称 */
  sourceName: string;
}
