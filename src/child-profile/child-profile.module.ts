import { Module } from '@nestjs/common';
import { ChildProfileController } from './child-profile.controller';
import { ChildProfileService } from './child-profile.service';
import { UserModule } from 'src/user/user.module';
import { PlayerProfileModule } from 'src/player-profile/player-profile.module';

@Module({
  controllers: [ChildProfileController],
  providers: [ChildProfileService],
  imports: [UserModule, PlayerProfileModule],
})
export class ChildProfileModule {}
