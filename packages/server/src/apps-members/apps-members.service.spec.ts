import { Test, TestingModule } from '@nestjs/testing';

import { AppsMembersService } from './apps-members.service';

describe('AppsMembersService', () => {
  let service: AppsMembersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppsMembersService],
    }).compile();

    service = module.get<AppsMembersService>(AppsMembersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
