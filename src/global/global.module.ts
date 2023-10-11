import { Global, Module } from '@nestjs/common';
import { GlobalController } from './global.controller';
import { GlobalService } from './global.service';

@Global()
@Module({
  controllers: [GlobalController],
  providers: [GlobalService],
  exports: [GlobalService],
})
export class GlobalModule {}
