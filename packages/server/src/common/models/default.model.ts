import { Directive, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DefaultModel {
  /**
   * 命名空间
   *
   * 从 schema 的 `meta.namespace` 中获取，没有的话默认返回 name
   */
  @Directive('@namespace')
  namespace?: string;
}
