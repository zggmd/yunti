import { registerEnumType } from '@nestjs/graphql';

export enum MemberRole {
  /** 访客 */
  Guest = 'Guest',
  /** 测试 */
  Reporter = 'Reporter',
  /** 开发者 */
  Developer = 'Developer',
  /** 维护者 */
  Maintainer = 'Maintainer',
  /** 拥有者 */
  Owner = 'Owner',
}

registerEnumType(MemberRole, {
  name: 'MemberRole',
  description: '组件成员的角色',
  valuesMap: {
    Guest: {
      description: '访客',
    },
    Reporter: {
      description: '测试',
    },
    Developer: {
      description: '开发者',
    },
    Maintainer: {
      description: '维护者',
    },
    Owner: {
      description: '拥有者',
    },
  },
});
