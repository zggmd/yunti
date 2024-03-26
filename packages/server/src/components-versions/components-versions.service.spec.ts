import { Test, TestingModule } from '@nestjs/testing';

import { ComponentsVersionsService } from './components-versions.service';

describe('ComponentsVersionsService', () => {
  let service: ComponentsVersionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ComponentsVersionsService],
    }).compile();

    service = module.get<ComponentsVersionsService>(ComponentsVersionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
