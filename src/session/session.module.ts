import { Module, forwardRef } from '@nestjs/common';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { PlayerProfileModule } from 'src/player-profile/player-profile.module';
import { SessionModel } from './session.model';
import { TrainerScheduleModule } from 'src/trainer-schedule/trainer-schedule.module';
import { TrainerProfileModule } from 'src/trainer-profile/trainer-profile.module';

@Module({
  controllers: [SessionController],
  providers: [SessionService, SessionModel],
  imports: [
    TrainerProfileModule,
    PlayerProfileModule,
    forwardRef(() => TrainerScheduleModule),
  ],
  exports: [SessionModel],
})
export class SessionModule {}
