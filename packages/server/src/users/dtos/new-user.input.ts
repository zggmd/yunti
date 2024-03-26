import { InputType } from '@nestjs/graphql';

import { UserRole } from '@/common/models/user-role.enum';

@InputType()
export class NewUserInput {
  /** 用户名 */
  name: string;

  /** 邮箱 */
  email: string;

  /** 角色 */
  role: UserRole;
}
