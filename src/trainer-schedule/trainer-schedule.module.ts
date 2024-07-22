import { Module, forwardRef } from '@nestjs/common';
import { TrainerProfileModule } from 'src/trainer-profile/trainer-profile.module';
import { TrainerScheduleController } from './trainer-schedule.controller';
import { UserTrainerScheduleController } from './user-trainer-schedule.controller';
import { AdminTrainerScheduleController } from './admin-trainer-schedule.controller';
import { TrainerScheduleService } from './trainer-schedule.service';
import { TrainerScheduleRepository } from './trainer-schedule.repository';
import { SessionModule } from 'src/session/session.module';
import { NotificationModule } from 'src/notification/notification.module';
import { FieldModule } from 'src/field/field.module';
import { UserModule } from 'src/user/user.module';
import { PlayerProfileModule } from 'src/player-profile/player-profile.module';

@Module({
  imports: [
    forwardRef(() => TrainerProfileModule),
    forwardRef(() => SessionModule),
    NotificationModule,
    FieldModule,
    UserModule,
    PlayerProfileModule,
  ],
  controllers: [
    TrainerScheduleController,
    UserTrainerScheduleController,
    AdminTrainerScheduleController,
  ],
  providers: [TrainerScheduleService, TrainerScheduleRepository],
  exports: [TrainerScheduleRepository, TrainerScheduleService],
})
export class TrainerScheduleModule {}
