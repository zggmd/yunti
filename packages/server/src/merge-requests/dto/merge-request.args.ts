import { Field, InputType } from '@nestjs/graphql';

import { Options } from '@/merge-requests/dto/merge-request.options';

@InputType({ description: '合并请求申请内容' })
export class MergeRequestInput {
  /** 原分支 */
  sourceBranch: string;

  /** 目标分支 */
  targetBranch: string;

  /** 合并人 */
  assigneeId: string;

  /** 合并 title */
  title?: string;

  /** 删除源分支选项 */
  @Field(() => JSON, { description: '页面内容', nullable: true })
  options?: Options;

  /** 合并说明 */
  description?: string;
}
