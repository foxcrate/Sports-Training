import { Module } from '@nestjs/common';
import { ChildController } from './child.controller';
import { ChildService } from './child.service';
import { UserModule } from 'src/user/user.module';

@Module({
  controllers: [ChildController],
  providers: [ChildService],
  imports: [UserModule],
})
export class ChildModule {}
