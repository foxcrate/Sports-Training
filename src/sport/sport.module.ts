import { Module } from '@nestjs/common';
import { SportController } from './sport.controller';
import { SportService } from './sport.service';
import { SportRepository } from './sport.repository';

@Module({
  controllers: [SportController],
  providers: [SportService, SportRepository],
  exports: [SportService, SportRepository],
})
export class SportModule {}
