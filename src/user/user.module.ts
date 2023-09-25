import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { ChildModule } from 'src/child/child.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({ secret: new ConfigService().get('JWT_SECRET') }),
    ChildModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
