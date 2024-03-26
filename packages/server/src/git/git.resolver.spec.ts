import { Test, TestingModule } from '@nestjs/testing';

import { GitResolver } from './git.resolver';

describe('GitResolver', () => {
  let resolver: GitResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GitResolver],
    }).compile();

    resolver = module.get<GitResolver>(GitResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
