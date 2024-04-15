import { Module, forwardRef } from '@nestjs/common';
import { TrainerProfileController } from './trainer-profile.controller';
import { TrainerProfileService } from './trainer-profile.service';
import { TrainerProfileRepository } from './trainer-profile.repository';
import { SportModule } from 'src/sport/sport.module';
import { RegionModule } from 'src/region/region.module';
import { TrainerScheduleModule } from 'src/trainer-schedule/trainer-schedule.module';

@Module({
  controllers: [TrainerProfileController],
  providers: [TrainerProfileService, TrainerProfileRepository],
  imports: [SportModule, RegionModule, forwardRef(() => TrainerScheduleModule)],
  exports: [TrainerProfileRepository],
})
export class TrainerProfileModule {}
