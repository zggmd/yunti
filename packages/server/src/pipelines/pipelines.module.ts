import { Module } from '@nestjs/common';
import { KubernetesModule } from '@yuntijs/k8s-client/kubernetes.module';

import { PipelinesService } from './pipelines.service';

@Module({
  providers: [PipelinesService],
  exports: [PipelinesService],
  imports: [KubernetesModule],
})
export class PipelinesModule {}
