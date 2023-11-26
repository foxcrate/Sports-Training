import { Module, forwardRef } from '@nestjs/common';
import { ChildProfileController } from './child-profile.controller';
import { ChildProfileService } from './child-profile.service';
import { ChildProfileModel } from './child-profile.model';
import { UserModule } from 'src/user/user.module';
import { ChildModule } from 'src/child/child.module';
import { SportModule } from 'src/sport/sport.module';

@Module({
  controllers: [ChildProfileController],
  providers: [ChildProfileService, ChildProfileModel],
  imports: [forwardRef(() => UserModule), ChildModule, SportModule],
  exports: [ChildProfileModel],
})
export class ChildProfileModule {}
