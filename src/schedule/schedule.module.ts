import { Module } from '@nestjs/common';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { ScheduleModel } from './schedule.model';
import { TrainerProfileModule } from 'src/trainer-profile/trainer-profile.module';

@Module({
  imports: [TrainerProfileModule],
  controllers: [ScheduleController],
  providers: [ScheduleService, ScheduleModel],
  exports: [ScheduleModel],
})
export class ScheduleModule {}
