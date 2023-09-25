import { Module } from '@nestjs/common';
import { SportController } from './sport.controller';
import { SportService } from './sport.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({ secret: new ConfigService().get('JWT_SECRET') }),
  ],
  controllers: [SportController],
  providers: [SportService],
})
export class SportModule {}
