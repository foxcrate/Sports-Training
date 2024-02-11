import { Module, forwardRef } from '@nestjs/common';
import { TrainerProfileModule } from 'src/trainer-profile/trainer-profile.module';
import { TrainerScheduleController } from './trainer-schedule.controller';
import { UserTrainerScheduleController } from './user-trainer-schedule.controller';
import { AdminTrainerScheduleController } from './admin-trainer-schedule.controller';
import { TrainerScheduleService } from './trainer-schedule.service';
import { TrainerScheduleModel } from './trainer-schedule.model';
import { SessionModule } from 'src/session/session.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    forwardRef(() => TrainerProfileModule),
    forwardRef(() => SessionModule),
    NotificationModule,
  ],
  controllers: [
    TrainerScheduleController,
    UserTrainerScheduleController,
    AdminTrainerScheduleController,
  ],
  providers: [TrainerScheduleService, TrainerScheduleModel],
  exports: [TrainerScheduleModel, TrainerScheduleService],
})
export class TrainerScheduleModule {}
