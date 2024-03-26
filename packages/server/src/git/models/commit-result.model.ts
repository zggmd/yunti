import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CommitResult {
  hash?: string;
  error?: string;
}
