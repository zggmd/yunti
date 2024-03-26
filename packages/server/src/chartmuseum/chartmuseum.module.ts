import { Module } from '@nestjs/common';

import { ChartmuseumResolver } from './chartmuseum.resolver';
import { ChartmuseumService } from './chartmuseum.service';

@Module({
  providers: [ChartmuseumResolver, ChartmuseumService],
  exports: [ChartmuseumService],
})
export class ChartmuseumModule {}
