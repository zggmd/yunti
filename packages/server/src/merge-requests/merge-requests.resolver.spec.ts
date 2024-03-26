import { Test, TestingModule } from '@nestjs/testing';

import { MergeRequestResolver } from './merge-requests.resolver';

describe('MergeRequestResolver', () => {
  let resolver: MergeRequestResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MergeRequestResolver],
    }).compile();

    resolver = module.get<MergeRequestResolver>(MergeRequestResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
