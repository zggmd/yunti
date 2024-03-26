import { Field, ObjectType } from '@nestjs/graphql';

import { Branch } from '@/common/entities/git/branches.entity';
import { PaginatedLog } from '@/common/entities/git/log.entity';
import { Tag } from '@/common/entities/git/tags.entity';

// import { Status } from '@/common/entities/git/status.entity';

@ObjectType()
export class Git {
  @Field(() => PaginatedLog, { description: '提交日志' })
  log?: PaginatedLog;

  @Field(() => [Branch], { description: '分支列表' })
  branches?: Branch[];

  // @Field(() => [Status], { description: '提交状态' })
  // status?: Status[];

  @Field(() => [Tag], { description: '标签列表' })
  tags?: Tag[];
}
