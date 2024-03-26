import { Field, InputType } from '@nestjs/graphql';

interface DataConflict {
  /*** 原表名 ***/
  tableName: string;

  /** 对比数据 ***/
  their: any;
}
interface SchemaConflict {
  /*** 原表名 ***/
  tableName: string;

  /** 对比结构 ***/
  their: {
    schema: string;
  };
}
interface ConflictData {
  /** 冲突数据 ***/
  dataConflicts?: DataConflict[];

  /** 冲突表结构 ***/
  schemaConflicts?: SchemaConflict[];
}

@InputType()
export class ConflictResolveInput {
  /** 冲突的 merge request 表主键 id */
  id: number;

  @Field(() => JSON, {
    description: '两个分支的冲突数据差异',
    nullable: false,
  })
  conflictData: ConflictData;
}
