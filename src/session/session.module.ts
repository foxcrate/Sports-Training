import { Module, forwardRef } from '@nestjs/common';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { PlayerProfileModule } from 'src/player-profile/player-profile.module';
import { SessionRepository } from './session.repository';
import { TrainerScheduleModule } from 'src/trainer-schedule/trainer-schedule.module';
import { TrainerProfileModule } from 'src/trainer-profile/trainer-profile.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  controllers: [SessionController],
  providers: [SessionService, SessionRepository],
  imports: [
    TrainerProfileModule,
    PlayerProfileModule,
    forwardRef(() => TrainerScheduleModule),
    NotificationModule,
  ],
  exports: [SessionRepository],
})
export class SessionModule {}
