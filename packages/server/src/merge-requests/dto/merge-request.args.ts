import { InputType } from '@nestjs/graphql';

@InputType({ description: '合并请求申请内容' })
export class MergeRequestInput {
  /** 冲突表名 */
  source_branch: string;

  /** 冲突表名 */
  target_branch: string;

  /** 合并人 */
  assignee_id: string;

  /** 合并 title */
  title?: string;

  /** 合并说明 */
  description?: string;
}
