import { Test, TestingModule } from '@nestjs/testing';

import { ChartmuseumResolver } from './chartmuseum.resolver';

describe('ChartmuseumResolver', () => {
  let resolver: ChartmuseumResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChartmuseumResolver],
    }).compile();

    resolver = module.get<ChartmuseumResolver>(ChartmuseumResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
