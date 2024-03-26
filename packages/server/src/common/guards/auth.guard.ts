import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';

import { Request } from '../../types';
import { UserRole } from '../models/user-role.enum';
import { LoginRequiredException, NO_AUTH } from '../utils';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<(UserRole | string)[]>('roles', context.getHandler()) || [];
    if (roles.includes(NO_AUTH)) {
      return true;
    }
    const request: Request = GqlExecutionContext.create(context).getContext().req;
    const loginUser = request.session?.loginUser;
    if (!loginUser) {
      throw new LoginRequiredException('Please log in to continue');
    }
    if (roles.length === 0) {
      return true;
    }
    if (!roles.includes(loginUser?.role)) {
      throw new ForbiddenException(`only ${roles} can access`);
    }
    return true;
  }
}
