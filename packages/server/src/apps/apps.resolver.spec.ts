import { Test, TestingModule } from '@nestjs/testing';

import { AppsResolver } from './apps.resolver';

describe('AppsResolver', () => {
  let resolver: AppsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppsResolver],
    }).compile();

    resolver = module.get<AppsResolver>(AppsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
