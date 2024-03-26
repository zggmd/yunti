import { FieldMiddleware, MiddlewareContext, NextFn } from '@nestjs/graphql';

import { decodeBase64 } from '../utils';

// Field middleware can be applied only to ObjectType classes.
// https://docs.nestjs.com/graphql/field-middleware
export const decodeBase64Middleware: FieldMiddleware = async (
  _ctx: MiddlewareContext,
  next: NextFn
) => {
  const value = await next();
  return decodeURIComponent(decodeBase64(value));
};
