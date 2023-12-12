import { Module } from '@nestjs/common';
import { TrainerProfileController } from './trainer-profile.controller';
import { TrainerProfileService } from './trainer-profile.service';
import { TrainerProfileModel } from './trainer-profile.model';
import { SportModule } from 'src/sport/sport.module';
import { RegionModule } from 'src/region/region.module';

@Module({
  controllers: [TrainerProfileController],
  providers: [TrainerProfileService, TrainerProfileModel],
  imports: [SportModule, RegionModule],
  exports: [TrainerProfileModel],
})
export class TrainerProfileModule {}
