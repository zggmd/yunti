import { Field, InputType } from '@nestjs/graphql';

import { ConflictData } from '../models/conflict-data.model';
import { ConflictSchema } from '../models/conflict-schema.model';

@InputType({ description: '最终结果合并' })
export class ConflictBranchDiffInput {
  /** 对比分支冲突数据
   * 数据种包含 base_xxx, our_xxx, their_xxx 字段类型
   * 除了前缀 base_, our_, their_ 后的字段为研发人员设计的字段类型
   * our_xxx 值为合并前字段值，their_xxx 值为合并过来的分支的值
   * 根据 our_xxx, their_xxx 对比后最终修改 their_xxx 提交后端，最终根据 their_xxx 解决冲突
   */
  @Field(() => [ConflictData], { description: '对比分支冲突数据' })
  conflictData?: Array<ConflictData>;

  /**
   * 冲突 schema 对比信息
   * schema: 冲突对比，若没有冲突值为 null, our_schema 为当前分支合并前 shema, their_schema 值为合并过来的分支的数据
   */
  @Field(() => [ConflictSchema], { description: '冲突schema' })
  conflictSchema?: Array<ConflictSchema>;
}
