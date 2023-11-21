import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { JwtModule } from '@nestjs/jwt';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { GeneralFilter } from './filters/general.filter';
import { APP_FILTER, APP_INTERCEPTOR, HttpAdapterHost } from '@nestjs/core';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { AuthModule } from './auth/auth.module';
import { ChildModule } from './child/child.module';
import { PrismaErrorsFilter } from './filters/prisma-errors.filter';
import { PlayerProfileModule } from './player-profile/player-profile.module';
import { RegionModule } from './region/region.module';
import { SportModule } from './sport/sport.module';
import { ChildProfileModule } from './child-profile/child-profile.module';
import { GlobalModule } from './global/global.module';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';

import { join } from 'path';
import { FieldModule } from './field/field.module';
import { DoctorClinicModule } from './doctor-clinic/doctor-clinic.module';
import { DoctorClinicSpecializationModule } from './doctor-clinic-specialization/doctor-clinic-specialization.module';
import { ScheduleModule } from './schedule/schedule.module';
import { TrainerProfileModule } from './trainer-profile/trainer-profile.module';
import { TimezoneMiddleware } from './middlewares/timezone.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.getOrThrow('JWT_SECRET'),
        };
      },
      inject: [ConfigService],
      global: true,
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [{ use: QueryResolver, options: ['lang'] }, AcceptLanguageResolver],
    }),
    PrismaModule,
    UserModule,
    AuthModule,
    ChildModule,
    PlayerProfileModule,
    RegionModule,
    SportModule,
    ChildProfileModule,
    GlobalModule,
    FieldModule,
    DoctorClinicModule,
    DoctorClinicSpecializationModule,
    ScheduleModule,
    TrainerProfileModule,
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
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TimezoneMiddleware).forRoutes('*');
  }
}
