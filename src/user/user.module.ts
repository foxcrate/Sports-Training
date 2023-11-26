import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ChildModule } from 'src/child/child.module';
import { FieldModule } from 'src/field/field.module';
import { UserModel } from './user.model';
import { ChildProfileModule } from 'src/child-profile/child-profile.module';

@Module({
  imports: [forwardRef(() => ChildProfileModule), ChildModule, FieldModule],
  controllers: [UserController],
  providers: [UserService, UserModel],
  exports: [UserService, UserModel],
})
export class UserModule {}
