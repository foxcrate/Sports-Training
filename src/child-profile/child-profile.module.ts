import { Module } from '@nestjs/common';
import { ChildProfileController } from './child-profile.controller';
import { ChildProfileService } from './child-profile.service';

@Module({
  controllers: [ChildProfileController],
  providers: [ChildProfileService],
})
export class ChildProfileModule {}
