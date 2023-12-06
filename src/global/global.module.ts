import { Global, Module } from '@nestjs/common';
import { GlobalController } from './global.controller';
import { GlobalService } from './global.service';
import { UserModel } from 'src/user/user.model';

@Global()
@Module({
  controllers: [GlobalController],
  providers: [GlobalService, UserModel],
  exports: [GlobalService, UserModel],
})
export class GlobalModule {}
