import { Module } from '@nestjs/common';
import { PlayerProfileController } from './player-profile.controller';
import { PlayerProfileService } from './player-profile.service';
import { PlayerProfileRepository } from './player-profile.repository';
import { SportModule } from 'src/sport/sport.module';
import { RegionModule } from 'src/region/region.module';

@Module({
  controllers: [PlayerProfileController],
  providers: [PlayerProfileService, PlayerProfileRepository],
  imports: [SportModule, RegionModule],
  exports: [PlayerProfileRepository],
})
export class PlayerProfileModule {}
