import { Test, TestingModule } from '@nestjs/testing';

import { BlocksResolver } from './blocks.resolver';

describe('BlocksResolver', () => {
  let resolver: BlocksResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlocksResolver],
    }).compile();

    resolver = module.get<BlocksResolver>(BlocksResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
