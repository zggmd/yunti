import { InputType } from '@nestjs/graphql';

@InputType({ description: '合并请求申请内容' })
export class MergeRequestInput {
  /** 原分支 */
  source_branch: string;

  /** 目标分支 */
  target_branch: string;

  /** 合并人 */
  assignee_id: string;

  /** 合并 title */
  title?: string;

  /** 合并说明 */
  description?: string;
}
