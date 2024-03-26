import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { Request } from '../../types';
import { CustomException, TREE_DEFAULT } from '../utils';

/** 树: 分支、标签或提交 */
export const Tree = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request: Request = GqlExecutionContext.create(ctx).getContext().req;
  const tree = request.query.tree || TREE_DEFAULT;
  return tree;
});

/** 默认树: 锁定树为 main */
export const MainTree = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request: Request = GqlExecutionContext.create(ctx).getContext().req;
  const tree = request.query.tree || TREE_DEFAULT;
  if (tree !== TREE_DEFAULT) {
    throw new CustomException(
      'TREE_MUST_BE_MAIN',
      'only allow query or mutate the main tree',
      400,
      { tree }
    );
  }
  return tree;
});
