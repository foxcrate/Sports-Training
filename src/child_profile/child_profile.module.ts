import { Module } from '@nestjs/common';
import { ChildProfileController } from './child_profile.controller';
import { ChildProfileService } from './child_profile.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({ secret: new ConfigService().get('JWT_SECRET') }),
  ],
  controllers: [ChildProfileController],
  providers: [ChildProfileService],
})
export class ChildProfileModule {}
