import { Module } from '@nestjs/common';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { HomeModel } from './home.model';
import { TrainerProfileModule } from 'src/trainer-profile/trainer-profile.module';
import { PlayerProfileModule } from 'src/player-profile/player-profile.module';

@Module({
  controllers: [HomeController],
  providers: [HomeService, HomeModel],
  imports: [TrainerProfileModule, PlayerProfileModule],
})
export class HomeModule {}
