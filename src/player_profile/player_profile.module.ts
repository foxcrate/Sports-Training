import { Module } from '@nestjs/common';
import { PlayerProfileController } from './player_profile.controller';
import { PlayerProfileService } from './player_profile.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({ secret: new ConfigService().get('JWT_SECRET') }),
  ],
  controllers: [PlayerProfileController],
  providers: [PlayerProfileService],
})
export class PlayerProfileModule {}
