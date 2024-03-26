import { Test, TestingModule } from '@nestjs/testing';

import { PublishRecordsResolver } from './publish-records.resolver';

describe('PublishRecordsResolver', () => {
  let resolver: PublishRecordsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PublishRecordsResolver],
    }).compile();

    resolver = module.get<PublishRecordsResolver>(PublishRecordsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
