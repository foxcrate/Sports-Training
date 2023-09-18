import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChildController } from './child.controller';
import { ChildService } from './child.service';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({ secret: new ConfigService().get('JWT_SECRET') }),
  ],
  controllers: [ChildController],
  providers: [ChildService],
  exports: [ChildService],
})
export class ChildModule {}
