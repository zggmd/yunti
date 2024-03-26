import { Test, TestingModule } from '@nestjs/testing';

import { ToolsResolver } from './tools.resolver';
import { ToolsService } from './tools.service';

describe('ToolsResolver', () => {
  let resolver: ToolsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ToolsResolver, ToolsService],
    }).compile();

    resolver = module.get<ToolsResolver>(ToolsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
