import { InputType } from '@nestjs/graphql';

import { MemberRole } from '@/common/models/member-role.enum';

@InputType()
export class AddAppMemberInput {
  /** 应用 id */
  appId: string;

  /** 成员 id */
  userId: string;

  /** 角色 */
  role: MemberRole;
}
