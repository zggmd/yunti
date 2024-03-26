import { InputType } from '@nestjs/graphql';

@InputType({ description: '查询合并请求申请列表条件' })
export class MergeRequestSearchInput {
  /** 分支名字 */
  tree?: string;

  /** 合并状态 */
  status?: string;

  /** app Id */
  appId?: string;

  /** componet Id */
  componentId?: string;
}
