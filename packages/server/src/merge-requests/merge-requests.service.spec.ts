import { Test, TestingModule } from '@nestjs/testing';

import { MergeRequestService } from './merge-requests.service';

describe('MergeRequestService', () => {
  let service: MergeRequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MergeRequestService],
    }).compile();

    service = module.get<MergeRequestService>(MergeRequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
