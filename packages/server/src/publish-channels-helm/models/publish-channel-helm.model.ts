import { Directive, Field, ObjectType } from '@nestjs/graphql';

import { Chartmuseum } from '@/chartmuseum/models/chartmuseum.model';

@ObjectType({ description: 'helm 仓库详情' })
export class PublishChannelHelm {
  /** 地址 */
  url: string;

  /** 用户名 */
  username?: string;

  /** 加密后的密码 */
  @Directive('@passwd')
  password?: string;

  /** 状态详情 */
  @Field(() => JSON, { description: '状态详情', nullable: true })
  status?: Record<string, any>;

  /** 一个 chart 版本 */
  @Field(() => Chartmuseum, { description: '一个 chart 版本', nullable: true })
  chart?: Chartmuseum;
}
