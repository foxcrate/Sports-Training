import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { JwtModule } from '@nestjs/jwt';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { GeneralFilter } from './filters/general.filter';
import { BadRequestFilter } from './filters/bad_request.filter';
import { APP_FILTER, APP_INTERCEPTOR, HttpAdapterHost } from '@nestjs/core';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { ChildService } from './child/child.service';
import { ChildModule } from './child/child.module';
import { PrismaErrorsFilter } from './filters/prisma_errors.filter';
import { PlayerProfileModule } from './player_profile/player_profile.module';
import { RegionModule } from './region/region.module';
import { SportModule } from './sport/sport.module';
import { ChildProfileModule } from './child_profile/child_profile.module';
import { GlobalModule } from './global/global.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    JwtModule,
    UserModule,
    AuthModule,
    ChildModule,
    PlayerProfileModule,
    RegionModule,
    SportModule,
    ChildProfileModule,
    GlobalModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: GeneralFilter,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaErrorsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: BadRequestFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    AuthService,
    ChildService,
  ],
})
export class AppModule {}
