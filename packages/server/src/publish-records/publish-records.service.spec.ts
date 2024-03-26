import { Test, TestingModule } from '@nestjs/testing';

import { PublishRecordsService } from './publish-records.service';

describe('PublishRecordsService', () => {
  let service: PublishRecordsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PublishRecordsService],
    }).compile();

    service = module.get<PublishRecordsService>(PublishRecordsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
