import { registerEnumType } from '@nestjs/graphql';

export enum UserRole {
  /** 系统管理员 */
  SystemAdmin = 'SystemAdmin',
  /** 普通用户 */
  User = 'User',
}

registerEnumType(UserRole, {
  name: 'UserRole',
  description: '用户角色',
  valuesMap: {
    SystemAdmin: {
      description: '系统管理员',
    },
    User: {
      description: '普通用户',
    },
  },
});
