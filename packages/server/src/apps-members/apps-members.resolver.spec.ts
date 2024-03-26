import { Test, TestingModule } from '@nestjs/testing';

import { AppsMembersResolver } from './apps-members.resolver';

describe('AppsMembersResolver', () => {
  let resolver: AppsMembersResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppsMembersResolver],
    }).compile();

    resolver = module.get<AppsMembersResolver>(AppsMembersResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
