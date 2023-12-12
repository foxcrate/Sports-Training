import { Module } from '@nestjs/common';
import { PlayerProfileController } from './player-profile.controller';
import { PlayerProfileService } from './player-profile.service';
import { PlayerProfileModel } from './player-profile.model';
import { SportModule } from 'src/sport/sport.module';
import { RegionModule } from 'src/region/region.module';

@Module({
  controllers: [PlayerProfileController],
  providers: [PlayerProfileService, PlayerProfileModel],
  imports: [SportModule, RegionModule],
  exports: [PlayerProfileModel],
})
export class PlayerProfileModule {}
