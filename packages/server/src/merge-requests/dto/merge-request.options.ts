import { InputType } from '@nestjs/graphql';

@InputType()
export class Options {
  /** 删除源分支选项，0：不删除，1：删除 */
  delSourceBranch?: number;
}
