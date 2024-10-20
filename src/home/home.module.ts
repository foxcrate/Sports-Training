import { Module } from '@nestjs/common';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { HomeRepository } from './home.repository';
import { TrainerProfileModule } from 'src/trainer-profile/trainer-profile.module';
import { PlayerProfileModule } from 'src/player-profile/player-profile.module';
import { UserModule } from 'src/user/user.module';

@Module({
  controllers: [HomeController],
  providers: [HomeService, HomeRepository],
  imports: [TrainerProfileModule, PlayerProfileModule, UserModule],
})
export class HomeModule {}
