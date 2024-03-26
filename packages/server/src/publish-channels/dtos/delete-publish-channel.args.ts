import { ArgsType } from '@nestjs/graphql';

@ArgsType()
export class DeletePublishChannelArgs {
  /** 发布渠道 id */
  id: string;

  /** 是否清除渠道对应的发布记录 */
  clearPublishRecords?: boolean;
}
