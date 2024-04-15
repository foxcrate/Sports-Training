import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { FieldModule } from 'src/field/field.module';
import { UserRepository } from './user.repository';
import { PlayerProfileModule } from 'src/player-profile/player-profile.module';

@Module({
  // imports: [forwardRef(() => ChildProfileModule)1, FieldModule],
  imports: [FieldModule, PlayerProfileModule],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService, UserRepository],
})
export class UserModule {}
