import { InputType } from '@nestjs/graphql';

import { PaginationArgs } from '@/common/models/pagination.args';

@InputType({ description: '获取提交记录的参数' })
export class CommitsArgs extends PaginationArgs {}
