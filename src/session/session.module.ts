import { Module } from '@nestjs/common';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { PlayerProfileModule } from 'src/player-profile/player-profile.module';
import { SessionModel } from './session.model';

@Module({
  controllers: [SessionController],
  providers: [SessionService, SessionModel],
  imports: [PlayerProfileModule],
  exports: [SessionModel],
})
export class SessionModule {}
