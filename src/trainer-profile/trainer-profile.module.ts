import { Module, forwardRef } from '@nestjs/common';
import { TrainerProfileController } from './trainer-profile.controller';
import { TrainerProfileService } from './trainer-profile.service';
import { TrainerProfileModel } from './trainer-profile.model';
import { SportModule } from 'src/sport/sport.module';
import { RegionModule } from 'src/region/region.module';
import { ScheduleModule } from 'src/schedule/schedule.module';

@Module({
  controllers: [TrainerProfileController],
  providers: [TrainerProfileService, TrainerProfileModel],
  imports: [SportModule, RegionModule, forwardRef(() => ScheduleModule)],
  exports: [TrainerProfileModel],
})
export class TrainerProfileModule {}
