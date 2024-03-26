import { Test, TestingModule } from '@nestjs/testing';

import { PublishChannelsHelmResolver } from './publish-channels-helm.resolver';

describe('PublishChannelsHelmResolver', () => {
  let resolver: PublishChannelsHelmResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PublishChannelsHelmResolver],
    }).compile();

    resolver = module.get<PublishChannelsHelmResolver>(PublishChannelsHelmResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
