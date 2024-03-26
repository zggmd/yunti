import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Chartmuseum 维护者' })
export class ChartmuseumMaintainer {
  name: string;
  url?: string;
  email?: string;
}

@ObjectType({ description: 'Chartmuseum 详情' })
export class Chartmuseum {
  /** 名称 */
  name: string;

  /** 官网地址 */
  home?: string;

  sources?: string[];

  /** 版本 */
  version: string;

  description?: string;

  keywords?: string[];

  @Field(() => [ChartmuseumMaintainer], {
    description: '维护者',
    nullable: true,
  })
  maintainers?: ChartmuseumMaintainer[];

  icon?: string;

  apiVersion?: string;

  appVersion?: string;

  urls?: string[];

  created: string;

  digest: string;
}
