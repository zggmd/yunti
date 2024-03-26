import { SetMetadata } from '@nestjs/common';

import { UserRole } from '../models/user-role.enum';

/**
 * 控制登录访问，也可以控制哪些角色可以访问
 * @param roles 角色
 */
export const Auth = (...roles: UserRole[]) => SetMetadata('roles', roles);

export { UserRole } from '../models/user-role.enum';
