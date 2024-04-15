import { Global, Module } from '@nestjs/common';
import { GlobalController } from './global.controller';
import { GlobalService } from './global.service';
import { UserRepository } from 'src/user/user.repository';
import { GlobalRepository } from './global.repository';

@Global()
@Module({
  controllers: [GlobalController],
  providers: [GlobalService, GlobalRepository, UserRepository],
  exports: [GlobalService, GlobalRepository, UserRepository],
})
export class GlobalModule {}
