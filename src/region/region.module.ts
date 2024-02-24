import { Module } from '@nestjs/common';
import { RegionController } from './region.controller';
import { RegionService } from './region.service';
import { RegionModel } from './region.model';

@Module({
  controllers: [RegionController],
  providers: [RegionService, RegionModel],
  exports: [RegionService, RegionModel],
})
export class RegionModule {}
