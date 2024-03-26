import { Test, TestingModule } from '@nestjs/testing';

import { ComponentsMembersService } from './components-members.service';

describe('ComponentsMembersService', () => {
  let service: ComponentsMembersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ComponentsMembersService],
    }).compile();

    service = module.get<ComponentsMembersService>(ComponentsMembersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
