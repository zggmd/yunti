import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: '冲突对比数据类型' })
export class Column {
  /** 冲突字段名称 */
  columnName: string;

  /** 本地值 */
  our: string;

  /** 远程值 */
  their: string;

  /** 最终值 */
  final: string;
}

@ObjectType({ description: '冲突对比数据类型' })
export class ConflictData {
  /** 冲突表名称 */
  conflictTable: string;

  /**
   * 冲突 schema 对比信息
   * schema: 冲突对比，若没有冲突值为 null, our_schema 为当前分支合并前 shema, their_schema 值为合并过来的分支的数据
   */
  @Field(() => [Column], { description: 'schema 对比信息' })
  columnData?: Array<Column>;
}
