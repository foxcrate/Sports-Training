import { Module, forwardRef } from '@nestjs/common';
import { TrainerProfileModule } from 'src/trainer-profile/trainer-profile.module';
import { TrainerScheduleController } from './trainer-schedule.controller';
import { UserTrainerScheduleController } from './user-trainer-schedule.controller';
import { AdminTrainerScheduleController } from './admin-trainer-schedule.controller';
import { TrainerScheduleService } from './trainer-schedule.service';
import { TrainerScheduleModel } from './trainer-schedule.model';

@Module({
  imports: [forwardRef(() => TrainerProfileModule)],
  controllers: [
    TrainerScheduleController,
    UserTrainerScheduleController,
    AdminTrainerScheduleController,
  ],
  providers: [TrainerScheduleService, TrainerScheduleModel],
  exports: [TrainerScheduleModel],
})
export class TrainerScheduleModule {}
