import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { SessionsModel } from './sessions.model';

@Module({
  controllers: [SessionsController],
  providers: [SessionsService, SessionsModel],
})
export class SessionsModule {}
