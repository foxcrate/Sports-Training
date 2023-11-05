import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import * as moment from 'moment-timezone';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/testTime')
  testTime(): moment.Moment {
    let dateFromRequest = '2023-10-30T07:00';
    // moment.locale('ar');
    // moment.tz.setDefault('America/New_York');
    // let localtz = moment.tz.guess();
    let jun: moment.Moment = moment.tz(dateFromRequest, 'Europe/London');

    // let b = moment.tz(jun, 'America/Toronto');
    // return b.locale(I18nContext.current().lang).format('YYYY-MM-DDThh:mm:ss');
    // return jun.tz('Africa/Cairo').format('kk:mm');
    // console.log({ localtz });
    console.log({ jun });
    let junFormated = jun.format();
    console.log({ junFormated });

    let junDate = new Date(jun.format());

    console.log({ junDate });

    return jun;
    // return this.appService.getHello();
  }

  @Post('/testFirebase')
  testFirebase() {}

  @Post('/testSQL')
  async testSQL() {
    let id = 3;
    let theField = await this.prisma.$queryRaw`
    WITH FieldDetailsWithBookedHours AS (
      SELECT
        f.id,
        f.name,
        f.acceptanceStatus,
        AVG(r.ratingNumber) AS rate,
        f.availableWeekDays AS availableWeekDays,
        f.availableDayHours AS availableDayHours,
        CASE
        WHEN COUNT(fbh.id ) = 0 THEN null
        ELSE
        JSON_ARRAYAGG(JSON_OBJECT(
          'id',fbh.id,
          'fromDateTime', fbh.fromDateTime,
          'userId',fbh.userId
          ))
        END AS fieldBookedHours
      FROM Field AS f
      LEFT JOIN
      FieldsBookedHours AS fbh
      ON
      f.id = fbh.fieldId
      LEFT JOIN
      Rate AS r
      ON
      f.id = r.fieldId
      WHERE
      f.id = ${id}
      GROUP BY f.id
    )
    SELECT 
      fdwbh.id,
      fdwbh.name,
      fdwbh.acceptanceStatus,
      fdwbh.rate,
      fdwbh.availableWeekDays AS availableWeekDays,
      fdwbh.availableDayHours AS availableDayHours,
      fdwbh.fieldBookedHours AS fieldBookedHours,
      CASE
      WHEN COUNT(fnad.id ) = 0 THEN null
      ELSE
      JSON_ARRAYAGG(JSON_OBJECT(
        'id',fnad.id,
        'dayDate', fnad.dayDate
        ))
      END AS fieldNotAvailableDays
    FROM FieldDetailsWithBookedHours AS fdwbh
    LEFT JOIN
    FieldNotAvailableDays AS fnad
    ON
    fdwbh.id = fnad.fieldId
    GROUP BY  fdwbh.id
    `;

    return theField[0];
  }
}
