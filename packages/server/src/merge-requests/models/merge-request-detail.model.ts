import { Field, ObjectType } from '@nestjs/graphql';

import { Commit } from '@/common/entities/git/commits.entity';
import { MergeRequest } from '@/common/entities/git/merge-request.entity';

@ObjectType({ description: '冲突对比数据' })
export class DiffDataBase {
  @Field(() => JSON, { description: '原有对象', nullable: true })
  our?: object;

  @Field(() => JSON, { description: '合并对象', nullable: true })
  their?: object;
}

@ObjectType({ description: '对比schema类型' })
export class SchemaDiff extends DiffDataBase {
  /*** 原表名 ***/
  tableName?: string;
}

@ObjectType({ description: '对比数据类型' })
export class DataDiff extends DiffDataBase {
  /*** 原表名 ***/
  tableName?: string;
}

@ObjectType({ description: '对比数据类型' })
export class DiffData {
  @Field(() => [SchemaDiff], { description: '表结构对比', nullable: true })
  schemaDiff?: SchemaDiff[];

  @Field(() => [DataDiff], { description: '数据对比', nullable: true })
  dataDiff?: DataDiff[];
}

@ObjectType({ description: '冲突对比数据类型' })
export class ConflictDiffData extends DiffDataBase {
  /*** 原表名 ***/
  tableName?: string;
}

@ObjectType({ description: '冲突对比数据类型' })
export class ConflictDiffSchema extends DiffDataBase {
  /*** 原表名 ***/
  tableName?: string;
}

@ObjectType({ description: '冲突数据类型' })
export class ConflictData {
  @Field(() => [ConflictDiffSchema], { description: '表结构冲突', nullable: true })
  schemaConflicts?: ConflictDiffSchema[];

  @Field(() => [ConflictDiffData], { description: '数据冲突', nullable: true })
  dataConflicts?: ConflictDiffData[];
}

@ObjectType({ description: '合并请求详细内容' })
export class MergeRequestDetail extends MergeRequest {
  @Field(() => [Commit], { description: '两个分支的提交差异', nullable: true })
  commits?: Commit[];

  @Field(() => DiffData, {
    description: '两个分支的提交 shema 差异',
    nullable: true,
  })
  diffData?: DiffData;

  @Field(() => ConflictData, {
    description: '冲突数据',
    nullable: true,
  })
  conflictData?: ConflictData;
}

@ObjectType({ description: '合并请求对比内容' })
export class MergeRequestDiff {
  @Field(() => [Commit], { description: '两个分支的提交差异', nullable: true })
  commits?: Commit[];

  @Field(() => DiffData, {
    description: '两个分支的提交 shema 差异',
    nullable: true,
  })
  diffData?: DiffData;
}
