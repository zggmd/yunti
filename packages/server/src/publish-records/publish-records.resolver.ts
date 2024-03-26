import { ValidationPipe } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { LoginUser } from '@/common/decorators/login-user.decorator';
import { PublishRecord } from '@/common/entities/publish-records.entity';
import { ILoginUser } from '@/types';

import { NewPublishInput } from './dtos/new-publish.input';
import { PublishRecordsService } from './publish-records.service';

@Resolver()
export class PublishRecordsResolver {
  constructor(private readonly publishRecordsService: PublishRecordsService) {}

  @Mutation(() => PublishRecord, {
    description: '发布应用',
  })
  async doPublish(
    @LoginUser() loginUser: ILoginUser,
    @Args('publish', new ValidationPipe())
    publish: NewPublishInput
  ): Promise<PublishRecord> {
    const res = await this.publishRecordsService.doPublish(loginUser, publish);
    return res;
  }

  @Mutation(() => Boolean, { description: '删除发布记录' })
  async publishRecordDelete(
    @LoginUser() loginUser: ILoginUser,
    @Args('id') id: string
  ): Promise<boolean> {
    return this.publishRecordsService.deletePublishRecord(loginUser, id);
  }

  @Query(() => PublishRecord, { description: '发布记录详情', nullable: true })
  async publishRecord(@Args('id') id: string): Promise<PublishRecord> {
    return this.publishRecordsService.getPublisRecordById(id);
  }
}
