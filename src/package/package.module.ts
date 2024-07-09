import { Module } from '@nestjs/common';
import { PlayerPackageController } from './player-package.controller';
import { PackageService } from './package.service';
import { TrainerPackageController } from './trainer-package.controller';
import { PackageRepository } from './package.repository';
import { TrainerProfileModule } from 'src/trainer-profile/trainer-profile.module';
import { TrainerScheduleModule } from 'src/trainer-schedule/trainer-schedule.module';

@Module({
  controllers: [PlayerPackageController, TrainerPackageController],
  providers: [PackageService, PackageRepository],
  imports: [TrainerProfileModule, TrainerScheduleModule],
})
export class PackageModule {}
