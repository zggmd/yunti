import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { Request } from '../../types';
import { LoginRequiredException } from '../utils';

export const LoginUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request: Request = GqlExecutionContext.create(ctx).getContext().req;
  const loginUser = request.session?.loginUser;
  if (!loginUser) {
    throw new LoginRequiredException('Please log in to continue');
  }
  return loginUser;
});
