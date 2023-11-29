import { Module } from '@nestjs/common';
import { TrainerProfileController } from './trainer-profile.controller';
import { TrainerProfileService } from './trainer-profile.service';
import { TrainerProfileModel } from './trainer-profile.model';

@Module({
  controllers: [TrainerProfileController],
  providers: [TrainerProfileService, TrainerProfileModel],
  exports: [TrainerProfileModel],
})
export class TrainerProfileModule {}
