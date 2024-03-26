import { Test, TestingModule } from '@nestjs/testing';

import { PublishChannelsService } from './publish-channels.service';

describe('PublishChannelsService', () => {
  let service: PublishChannelsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PublishChannelsService],
    }).compile();

    service = module.get<PublishChannelsService>(PublishChannelsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
