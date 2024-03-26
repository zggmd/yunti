import { Test, TestingModule } from '@nestjs/testing';

import { ChartmuseumService } from './chartmuseum.service';

describe('ChartmuseumService', () => {
  let service: ChartmuseumService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChartmuseumService],
    }).compile();

    service = module.get<ChartmuseumService>(ChartmuseumService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
