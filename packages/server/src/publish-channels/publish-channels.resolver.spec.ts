import { Test, TestingModule } from '@nestjs/testing';

import { PublishChannelsResolver } from './publish-channels.resolver';

describe('PublishChannelsResolver', () => {
  let resolver: PublishChannelsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PublishChannelsResolver],
    }).compile();

    resolver = module.get<PublishChannelsResolver>(PublishChannelsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
