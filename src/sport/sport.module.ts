import { Module } from '@nestjs/common';
import { SportController } from './sport.controller';
import { SportService } from './sport.service';
import { SportModel } from './sport.model';

@Module({
  controllers: [SportController],
  providers: [SportService, SportModel],
  exports: [SportService, SportModel],
})
export class SportModule {}
