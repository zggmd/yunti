import { InputType } from '@nestjs/graphql';

import { PaginationArgs } from '@/common/models/pagination.args';

@InputType({ description: '获取提交记录的参数' })
export class AppCommitsOptions extends PaginationArgs {
  /** 提交 id 或 提交信息进行模糊搜索 */
  q?: string;
}
