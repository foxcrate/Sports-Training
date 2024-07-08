import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { JwtModule } from '@nestjs/jwt';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { UserModule } from './user/user.module.js';
import { GeneralFilter } from './filters/general.filter.js';
import { APP_FILTER, APP_INTERCEPTOR, HttpAdapterHost } from '@nestjs/core';
import { TransformInterceptor } from './interceptors/transform.interceptor.js';
import { AuthModule } from './auth/auth.module.js';
import { PrismaErrorsFilter } from './filters/prisma-errors.filter.js';
import { PlayerProfileModule } from './player-profile/player-profile.module.js';
import { RegionModule } from './region/region.module.js';
import { SportModule } from './sport/sport.module.js';
import { GlobalModule } from './global/global.module.js';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';

import { join } from 'path';
import { FieldModule } from './field/field.module.js';
import { DoctorClinicModule } from './doctor-clinic/doctor-clinic.module.js';
import { DoctorClinicSpecializationModule } from './doctor-clinic-specialization/doctor-clinic-specialization.module.js';
import { TrainerScheduleModule } from './trainer-schedule/trainer-schedule.module.js';
import { TrainerProfileModule } from './trainer-profile/trainer-profile.module.js';
import { TimezoneMiddleware } from './middlewares/timezone.middleware.js';
import { ChildProfileModule } from './child-profile/child-profile.module.js';
import { ChildModule } from './child/child.module.js';
import { CalendarModule } from './calendar/calendar.module.js';
import { HomeModule } from './home/home.module.js';
import { ProfileModule } from './profile/profile.module.js';
import { SessionModule } from './session/session.module.js';
import { NotificationModule } from './notification/notification.module.js';
import { PrismaService } from './prisma/prisma.service.js';
import { PackageModule } from './package/package.module.js';

(async () => {
  const adminjsPrisma = await import('@adminjs/prisma');
  const adminjs = await import('adminjs');
  // adminjs
  adminjs.default.registerAdapter({
    Database: adminjsPrisma.Database,
    Resource: adminjsPrisma.Resource,
  });
})();

const DEFAULT_ADMIN = {
  email: 'admin@admin.com',
  password: 'admin',
};

const authenticate = async (email: string, password: string) => {
  if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
    return Promise.resolve(DEFAULT_ADMIN);
  }
  return null;
};

@Module({
  imports: [
    import('@adminjs/nestjs').then(({ AdminModule }) =>
      AdminModule.createAdminAsync({
        useFactory: async () => ({
          adminJsOptions: {
            rootPath: '/admin',
            resources: [
              {
                resource: {
                  model: await (await import('@adminjs/prisma')).getModelByName('User'),
                  client: PrismaService.getInstance(),
                },
                options: {},
              },
              {
                resource: {
                  model: await (await import('@adminjs/prisma')).getModelByName('Gender'),
                  client: PrismaService.getInstance(),
                },
                options: {},
              },
              {
                resource: {
                  model: await (
                    await import('@adminjs/prisma')
                  ).getModelByName('GenderTranslation'),
                  client: PrismaService.getInstance(),
                },
                options: {},
              },
              {
                resource: {
                  model: await (
                    await import('@adminjs/prisma')
                  ).getModelByName('PlayerProfile'),
                  client: PrismaService.getInstance(),
                },
                options: {},
              },
              {
                resource: {
                  model: await (
                    await import('@adminjs/prisma')
                  ).getModelByName('TrainerProfile'),
                  client: PrismaService.getInstance(),
                },
                options: {},
              },
              {
                resource: {
                  model: await (await import('@adminjs/prisma')).getModelByName('Sport'),
                  client: PrismaService.getInstance(),
                },
                options: {},
              },
              {
                resource: {
                  model: await (
                    await import('@adminjs/prisma')
                  ).getModelByName('SportTranslation'),
                  client: PrismaService.getInstance(),
                },
                options: {},
              },
              {
                resource: {
                  model: await (await import('@adminjs/prisma')).getModelByName('Field'),
                  client: PrismaService.getInstance(),
                },
                options: {},
              },
              {
                resource: {
                  model: await (
                    await import('@adminjs/prisma')
                  ).getModelByName('DoctorClinic'),
                  client: PrismaService.getInstance(),
                },
                options: {},
              },
              {
                resource: {
                  model: await (
                    await import('@adminjs/prisma')
                  ).getModelByName('DoctorClinicSpecialization'),
                  client: PrismaService.getInstance(),
                },
                options: {},
              },
              {
                resource: {
                  model: await (
                    await import('@adminjs/prisma')
                  ).getModelByName('DoctorClinicSpecializationTranslation'),
                  client: PrismaService.getInstance(),
                },
                options: {},
              },
              {
                resource: {
                  model: await (
                    await import('@adminjs/prisma')
                  ).getModelByName('SessionRequest'),
                  client: PrismaService.getInstance(),
                },
                options: {},
              },
              {
                resource: {
                  model: await (
                    await import('@adminjs/prisma')
                  ).getModelByName('CancellationReasons'),
                  client: PrismaService.getInstance(),
                },
                options: {},
              },
              {
                resource: {
                  model: await (
                    await import('@adminjs/prisma')
                  ).getModelByName('CancellationReasonsTranslation'),
                  client: PrismaService.getInstance(),
                },
                options: {},
              },
              {
                resource: {
                  model: await (
                    await import('@adminjs/prisma')
                  ).getModelByName('Notification'),
                  client: PrismaService.getInstance(),
                },
                options: {},
              },
              {
                resource: {
                  model: await (
                    await import('@adminjs/prisma')
                  ).getModelByName('Certificate'),
                  client: PrismaService.getInstance(),
                },
                options: {},
              },
              {
                resource: {
                  model: await (
                    await import('@adminjs/prisma')
                  ).getModelByName('FieldsBookedHours'),
                  client: PrismaService.getInstance(),
                },
                options: {},
              },
              {
                resource: {
                  model: await (
                    await import('@adminjs/prisma')
                  ).getModelByName('DoctorClinicsBookedHours'),
                  client: PrismaService.getInstance(),
                },
                options: {},
              },
              {
                resource: {
                  model: await (await import('@adminjs/prisma')).getModelByName('Region'),
                  client: PrismaService.getInstance(),
                },
                options: {},
              },
              {
                resource: {
                  model: await (
                    await import('@adminjs/prisma')
                  ).getModelByName('RegionTranslation'),
                  client: PrismaService.getInstance(),
                },
                options: {},
              },
              {
                resource: {
                  model: await (
                    await import('@adminjs/prisma')
                  ).getModelByName('Feedback'),
                  client: PrismaService.getInstance(),
                },
                options: {},
              },
              {
                resource: {
                  model: await (
                    await import('@adminjs/prisma')
                  ).getModelByName('FeedbackTranslation'),
                  client: PrismaService.getInstance(),
                },
                options: {},
              },
              {
                resource: {
                  model: await (await import('@adminjs/prisma')).getModelByName('Rate'),
                  client: PrismaService.getInstance(),
                },
                options: {},
              },
              {
                resource: {
                  model: await (
                    await import('@adminjs/prisma')
                  ).getModelByName('Schedule'),
                  client: PrismaService.getInstance(),
                },
                options: {},
              },
              {
                resource: {
                  model: await (await import('@adminjs/prisma')).getModelByName('Level'),
                  client: PrismaService.getInstance(),
                },
                options: {},
              },
              {
                resource: {
                  model: await (
                    await import('@adminjs/prisma')
                  ).getModelByName('LevelTranslation'),
                  client: PrismaService.getInstance(),
                },
                options: {},
              },
              {
                resource: {
                  model: await (
                    await import('@adminjs/prisma')
                  ).getModelByName('AgeGroup'),
                  client: PrismaService.getInstance(),
                },
                options: {},
              },
              {
                resource: {
                  model: await (
                    await import('@adminjs/prisma')
                  ).getModelByName('AgeGroupTranslation'),
                  client: PrismaService.getInstance(),
                },
                options: {},
              },
              {
                resource: {
                  model: await (
                    await import('@adminjs/prisma')
                  ).getModelByName('TrainerBookedSession'),
                  client: PrismaService.getInstance(),
                },
                options: {},
              },
              {
                resource: {
                  model: await (await import('@adminjs/prisma')).getModelByName('Slot'),
                  client: PrismaService.getInstance(),
                },
                options: {},
              },
              {
                resource: {
                  model: await (
                    await import('@adminjs/prisma')
                  ).getModelByName('WeekDay'),
                  client: PrismaService.getInstance(),
                },
                options: {},
              },
              {
                resource: {
                  model: await (
                    await import('@adminjs/prisma')
                  ).getModelByName('WeekDayTranslation'),
                  client: PrismaService.getInstance(),
                },
                options: {},
              },
              {
                resource: {
                  model: await (
                    await import('@adminjs/prisma')
                  ).getModelByName('NotificationContent'),
                  client: PrismaService.getInstance(),
                },
                options: {},
              },
              {
                resource: {
                  model: await (
                    await import('@adminjs/prisma')
                  ).getModelByName('NotificationContentTranslation'),
                  client: PrismaService.getInstance(),
                },
                options: {},
              },
              //----------------------------
              // {
              //   resource: {
              //     model: await (
              //       await import('@adminjs/prisma')
              //     ).getModelByName('PlayerProfileSports'),
              //     client: PrismaService.getInstance(),
              //   },
              //   options: {},
              // },
              {
                resource: {
                  model: await (await import('@adminjs/prisma')).getModelByName('Month'),
                  client: PrismaService.getInstance(),
                },
                options: {},
              },
              {
                resource: {
                  model: await (
                    await import('@adminjs/prisma')
                  ).getModelByName('MonthTranslation'),
                  client: PrismaService.getInstance(),
                },
                options: {},
              },
              {
                resource: {
                  model: await (
                    await import('@adminjs/prisma')
                  ).getModelByName('SchedulesMonths'),
                  client: PrismaService.getInstance(),
                },
                options: {},
              },
              // {
              //   resource: {
              //     model: await (
              //       await import('@adminjs/prisma')
              //     ).getModelByName('TrainerProfileSports'),
              //     client: PrismaService.getInstance(),
              //   },
              //   options: {},
              // },
              {
                resource: {
                  model: await (
                    await import('@adminjs/prisma')
                  ).getModelByName('TrainerProfileNotAvailableDays'),
                  client: PrismaService.getInstance(),
                },
                options: {},
              },
              {
                resource: {
                  model: await (
                    await import('@adminjs/prisma')
                  ).getModelByName('Picture'),
                  client: PrismaService.getInstance(),
                },
                options: {},
              },
              {
                resource: {
                  model: await (
                    await import('@adminjs/prisma')
                  ).getModelByName('FieldNotAvailableDays'),
                  client: PrismaService.getInstance(),
                },
                options: {},
              },
              {
                resource: {
                  model: await (
                    await import('@adminjs/prisma')
                  ).getModelByName('DoctorClinicNotAvailableDays'),
                  client: PrismaService.getInstance(),
                },
                options: {},
              },
            ],
          },
          auth: {
            authenticate,
            cookieName: 'adminjs',
            cookiePassword: 'secret',
          },
          sessionOptions: {
            resave: true,
            saveUninitialized: true,
            secret: 'secret',
          },
        }),
      }),
    ),
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
    PlayerProfileModule,
    RegionModule,
    SportModule,
    GlobalModule,
    FieldModule,
    DoctorClinicModule,
    DoctorClinicSpecializationModule,
    TrainerScheduleModule,
    TrainerProfileModule,
    ChildProfileModule,
    ChildModule,
    CalendarModule,
    HomeModule,
    ProfileModule,
    SessionModule,
    NotificationModule,
    PackageModule,
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
