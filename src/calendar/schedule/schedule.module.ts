import { Module } from '@nestjs/common';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { ScheduleModel } from './schedule.model';

@Module({
  controllers: [ScheduleController],
  providers: [ScheduleService, ScheduleModel],
})
export class ScheduleModule {
  constructor() {}
}
