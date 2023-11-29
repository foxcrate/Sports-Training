import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { FieldModule } from 'src/field/field.module';
import { UserModel } from './user.model';
import { PlayerProfileModule } from 'src/player-profile/player-profile.module';

@Module({
  // imports: [forwardRef(() => ChildProfileModule)1, FieldModule],
  imports: [FieldModule, PlayerProfileModule],
  controllers: [UserController],
  providers: [UserService, UserModel],
  exports: [UserService, UserModel],
})
export class UserModule {}
