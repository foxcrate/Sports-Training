import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { ProfileModel } from './profile.model';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService, ProfileModel],
})
export class ProfileModule {}
