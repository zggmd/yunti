import { Test, TestingModule } from '@nestjs/testing';

import { ComponentsVersionsResolver } from './components-versions.resolver';

describe('ComponentsVersionsResolver', () => {
  let resolver: ComponentsVersionsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ComponentsVersionsResolver],
    }).compile();

    resolver = module.get<ComponentsVersionsResolver>(ComponentsVersionsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
