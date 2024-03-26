import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { TranslateArgs } from './dto/translate.args';
import { TranslationResult } from './models/tool.model';
import { ToolsService } from './tools.service';

@Resolver()
export class ToolsResolver {
  constructor(private readonly toolsService: ToolsService) {}

  @Mutation(() => TranslationResult)
  translate(@Args() options: TranslateArgs) {
    return this.toolsService.translate(options);
  }
}
