import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ChildModule } from 'src/child/child.module';
import { FieldModule } from 'src/field/field.module';

@Module({
  imports: [ChildModule, FieldModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
