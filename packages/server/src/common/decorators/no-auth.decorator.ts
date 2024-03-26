import { SetMetadata } from '@nestjs/common';

import { NO_AUTH } from '../utils';

/**
 * 不登录也可以访问
 */
export const NoAuth = () => SetMetadata('roles', NO_AUTH);

export { UserRole } from '../models/user-role.enum';
