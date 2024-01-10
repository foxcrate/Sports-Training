import { Global, Module } from '@nestjs/common';
import { GlobalController } from './global.controller';
import { GlobalService } from './global.service';
import { UserModel } from 'src/user/user.model';
import { GlobalModel } from './global.model';

@Global()
@Module({
  controllers: [GlobalController],
  providers: [GlobalService, GlobalModel, UserModel],
  exports: [GlobalService, GlobalModel, UserModel],
})
export class GlobalModule {}
