import { ObjectType } from '@nestjs/graphql';

@ObjectType({ description: '冲突对比数据类型' })
export class ConflictSchema {
  /** 冲突表名 */
  table_name: string;

  /** 本地结构 */
  our_schema: string;

  /** 远程结构 */
  their_schema: string;

  /** 远程结构 */
  final_schema: string;
}
