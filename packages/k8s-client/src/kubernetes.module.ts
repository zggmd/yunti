import { DynamicModule, Global, Module } from '@nestjs/common';

import { K8S_CLIENT_CONFIG } from './kubernetes.constants';
import { K8sConfig, KubernetesService } from './kubernetes.service';

@Global()
@Module({})
export class KubernetesModule {
  static forRoot(config: K8sConfig): DynamicModule {
    return {
      module: KubernetesModule,
      providers: [
        {
          provide: K8S_CLIENT_CONFIG,
          useValue: config,
        },
        KubernetesService,
      ],
      exports: [KubernetesService],
    };
  }
}
