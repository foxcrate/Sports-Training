import { Global, Module } from '@nestjs/common';
import { GlobalController } from './global.controller';
import { GlobalService } from './global.service';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';

@Global()
@Module({
  imports: [
    PrismaModule,
    JwtModule.register({ secret: new ConfigService().get('JWT_SECRET') }),
  ],
  controllers: [GlobalController],
  providers: [GlobalService],
  exports: [GlobalService],
})
export class GlobalModule {}
