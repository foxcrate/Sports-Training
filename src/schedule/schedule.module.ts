import { Module, forwardRef } from '@nestjs/common';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { ScheduleModel } from './schedule.model';
import { TrainerProfileModule } from 'src/trainer-profile/trainer-profile.module';
import { AdminScheduleController } from './admin-schedule.controller';

@Module({
  imports: [forwardRef(() => TrainerProfileModule)],
  controllers: [ScheduleController, AdminScheduleController],
  providers: [ScheduleService, ScheduleModel],
  exports: [ScheduleModel],
})
export class ScheduleModule {}
