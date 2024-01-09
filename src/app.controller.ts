import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import * as moment from 'moment-timezone';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { PrismaService } from './prisma/prisma.service';
import { GlobalService } from './global/global.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private prisma: PrismaService,
    private readonly i18n: I18nService,
    private globalSerice: GlobalService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/testTime')
  testTime() {
    // let dateFromRequest = '2023-10-30T07:00';
    // moment.locale('ar');
    // moment.tz.setDefault('America/New_York');
    // let localtz = moment.tz.guess();
    // let jun: moment.Moment = moment.tz(dateFromRequest, 'Europe/London');
    // let b = moment.tz(jun, 'America/Toronto');
    // return b.locale(I18nContext.current().lang).format('YYYY-MM-DDThh:mm:ss');
    // return jun.tz('Africa/Cairo').format('kk:mm');
    // console.log({ localtz });
    // console.log({ jun });
    // let junFormated = jun.format();
    // console.log({ junFormated });
    // let junDate = new Date(jun.format());
    // console.log({ junDate });
    // return moment(moment().format()).format();
    // console.log(this.globalSerice.getLocalDateTime(new Date()));
    // console.log(moment(new Date()).format('YYYY-MM-DD HH:mm:ss'));
    // const CairoDateTime = moment('2020-4-4 05:00').utc();
    // const LondonDateTime = moment('2020-4-4 05:00').utc();
    // let utcDateTime = DateTime.utc();
    // let utcDateTimeFormated = utcDateTime.format('HH:mmZ');
    // const dow = date.day();
    // return date.tz('Europe/London').format('HH:mm');
    // console.log(CairoDateTime.tz('Africa/Cairo'));
    // console.log(LondonDateTime.tz('Europe/London'));
    // let localDateTime = utcDateTime.tz('Africa/Cairo');
    // console.log({ localDateTime });
    // return 'allow';
    // return utcDateTime.tz('Africa/Cairo').format();
    // let jun = moment(`2020-01-01T${this.globalSerice.timeTo24('10:00 PM')}`);
    // return jun;
    // return this.appService.getHello();
    // let x = 2;
    // return this.globalSerice.getDayNameByNumber(x);
    // let status = false;
    // let currentDate = moment();
    // let startDate = moment().startOf('week');
    // let endDate = moment().endOf('week');
    // status = currentDate.isBetween(startDate, endDate);
    // let x = moment().format('dddd');
    let x = moment().format('MMMM');
    return x;
    // return { currentDate, startDate, endDate, status };
  }

  @Get('/testFirebase')
  async testFirebase() {
    let id = 4;
    let doctorClinic = await this.prisma.$queryRaw`
    WITH
      ClinicWithBookedHours AS (
      SELECT dc.id, dc.name, dc.acceptanceStatus, dc.availableWeekDays AS availableWeekDays, dc.availableDayHours AS availableDayHours,
      CASE WHEN COUNT(dcbh.id ) = 0 THEN null
      ELSE
      JSON_ARRAYAGG(JSON_OBJECT(
        'id',dcbh.id,
        'fromDateTime', dcbh.fromDateTime,
        'userId',dcbh.userId
        ))
      END AS doctorClinicBookedHours
      FROM DoctorClinic AS dc
      LEFT JOIN DoctorClinicsBookedHours AS dcbh
      ON dc.id = dcbh.doctorClinicId
      WHERE dc.id = ${id}
      GROUP BY dc.id
    ),
    PicturesTable AS (
        SELECT doctorClinicId,
        CASE WHEN COUNT(p.id) = 0 THEN null
        ELSE
        JSON_ARRAYAGG(JSON_OBJECT(
          'id',p.id,
          'imageLink', p.imageLink
          ))
        END AS gallery
        FROM Picture as p
        WHERE doctorClinicId = ${id}
        GROUP BY p.doctorClinicId
      )
      SELECT cwbh.id, cwbh.name, cwbh.acceptanceStatus,
        cwbh.availableWeekDays AS availableWeekDays,
        cwbh.availableDayHours AS availableDayHours,
        cwbh.doctorClinicBookedHours AS doctorClinicBookedHours,
        ps.gallery AS gallery
      FROM ClinicWithBookedHours AS cwbh
      LEFT JOIN PicturesTable AS ps
      ON cwbh.id = ps.doctorClinicId
      GROUP BY cwbh.id,ps.gallery
    `;
    return doctorClinic;
  }

  async testSQL2() {
    let id = 2;
    let theField = await this.prisma.$queryRaw`
    WITH ClinicWithBookedHours AS (
     SELECT
        dc.id,
        dc.name,
        dc.acceptanceStatus,
        dc.availableWeekDays AS availableWeekDays,
        dc.availableDayHours AS availableDayHours,
        CASE
        WHEN COUNT(dcbh.id ) = 0 THEN null
        ELSE
        JSON_ARRAYAGG(JSON_OBJECT(
          'id',dcbh.id,
          'fromDateTime', dcbh.fromDateTime,
          'userId',dcbh.userId
          ))
        END AS doctorClinicBookedHours
      FROM DoctorClinic AS dc
      LEFT JOIN
      DoctorClinicsBookedHours AS dcbh
      ON
      dc.id = dcbh.doctorClinicId
      WHERE
      dc.id = ${id}
      GROUP BY dc.id
      )
      SELECT
        cwbh.id,
        cwbh.name,
        cwbh.acceptanceStatus,
        cwbh.availableWeekDays AS availableWeekDays,
        cwbh.availableDayHours AS availableDayHours,
        cwbh.doctorClinicBookedHours AS doctorClinicBookedHours
      FROM
      ClinicWithBookedHours as cwbh
      GROUP BY cwbh.id
    `;

    return theField[0];
  }

  async testSQL() {
    let id = 25;
    let theField = await this.prisma.$queryRaw`
    SELECT
      f.id,
      f.name,
      f.availableWeekDays AS availableWeekDays,
      f.availableDayHours AS availableDayHours,
      fbh.fieldBookedHours AS fieldBookedHours,
      GROUP_CONCAT(DISTINCT STR_TO_DATE(fnad.dayDate,'%Y-%m-%d') )
      AS
      fieldNotAvailableDays
      FROM Field AS f
      INNER JOIN FieldNotAvailableDays AS fnad ON f.id = fnad.fieldId
      INNER JOIN (
        SELECT
        id,
        fieldId AS fieldId,
        CASE
        WHEN COUNT(fbh.id ) = 0 THEN null
        ELSE
        JSON_ARRAYAGG( JSON_OBJECT(
          'id',fbh.id,
          'fromDateTime', fbh.fromDateTime,
          'userId',fbh.userId
          ))
        END
        AS
        fieldBookedHours
        FROM
        FieldsBookedHours as fbh
        GROUP BY 
        fbh.id
      ) AS fbh ON f.id = fbh.fieldId
      
      GROUP BY f.id,fbh.id
    `;

    return theField[0];
  }

  @Get('/testSQL')
  async testSQL3() {
    let name = 'el-hamdClinic meme';
    let DoctorClinic = await this.prisma.$queryRaw`
    WITH 
    GetDoctorClinicIdCTE AS (
      SELECT id AS DoctorClinicId
      FROM DoctorClinic
      WHERE name = ${name}
      LIMIT 1
    ),
    RatingAvgTable AS (
      SELECT doctorClinicId,r.ratingNumber AS RatingNumber
      FROM Rate as r
      WHERE doctorClinicId = (SELECT DoctorClinicId FROM GetDoctorClinicIdCTE)
    ),
  Last5Feedbacks AS (
      SELECT doctorClinicId,feedback
      FROM Rate
      WHERE doctorClinicId = (SELECT DoctorClinicId FROM GetDoctorClinicIdCTE)
      LIMIT 5
    ),
    NotAvailableDays AS (
      SELECT doctorClinicId,
      CASE WHEN COUNT(nad.id ) = 0 THEN null
      ELSE
      JSON_ARRAYAGG(JSON_OBJECT(
        'id',nad.id,
        'dayDate', nad.dayDate
        ))
      END AS doctorClinicNotAvailableDays
      FROM
      DoctorClinicNotAvailableDays as nad
      WHERE doctorClinicId = (SELECT DoctorClinicId FROM GetDoctorClinicIdCTE)
      GROUP BY doctorClinicId
    ),
  ClinicWithBookedHours AS (
    SELECT dc.id, dc.name, dc.acceptanceStatus,
      dc.availableWeekDays AS availableWeekDays,
      dc.availableDayHours AS availableDayHours,
      CASE
      WHEN COUNT(dcbh.id ) = 0 THEN null
      ELSE
      JSON_ARRAYAGG(JSON_OBJECT(
        'id',dcbh.id,
        'fromDateTime', dcbh.fromDateTime,
        'userId',dcbh.userId
        ))
      END AS doctorClinicBookedHours
    FROM DoctorClinic AS dc
    LEFT JOIN DoctorClinicsBookedHours AS dcbh
    ON dc.id = dcbh.doctorClinicId
    WHERE dc.id = (SELECT DoctorClinicId FROM GetDoctorClinicIdCTE)
    GROUP BY dc.id
    ),
    ClinicWithBookedHoursAndFeedbacks AS (
    SELECT cwbh.id, cwbh.name, cwbh.acceptanceStatus,
      CASE WHEN COUNT(l5f.doctorClinicId ) = 0 THEN null
      ELSE
      JSON_ARRAYAGG(l5f.feedback)
      END AS Feedbacks,
      cwbh.availableWeekDays AS availableWeekDays,
      cwbh.availableDayHours AS availableDayHours,
      cwbh.doctorClinicBookedHours AS doctorClinicBookedHours
    FROM ClinicWithBookedHours as cwbh
    LEFT JOIN Last5Feedbacks as l5f
    ON l5f.doctorClinicId = cwbh.id
    GROUP BY cwbh.id
    ),
    ClinicWithBookedHoursAndFeedbacksAndAvg AS(
    SELECT cwbhaf.id, cwbhaf.name, cwbhaf.acceptanceStatus,
      AVG(rav.RatingNumber) AS RatingNumber,
      cwbhaf.feedbacks,
      cwbhaf.availableWeekDays AS availableWeekDays,
      cwbhaf.availableDayHours AS availableDayHours,
      cwbhaf.doctorClinicBookedHours AS doctorClinicBookedHours
    FROM ClinicWithBookedHoursAndFeedbacks as cwbhaf
    LEFT JOIN RatingAvgTable as rav
    ON cwbhaf.id = rav.doctorClinicId
    GROUP BY cwbhaf.id
    )
    SELECT cwbhafaa.id, cwbhafaa.name, cwbhafaa.acceptanceStatus,
      cwbhafaa.RatingNumber AS RatingNumber,
      cwbhafaa.feedbacks,
      cwbhafaa.availableWeekDays AS availableWeekDays,
      cwbhafaa.availableDayHours AS availableDayHours,
      nad.doctorClinicNotAvailableDays AS DoctorClinicNotAvailableDays,
      cwbhafaa.doctorClinicBookedHours AS doctorClinicBookedHours
    FROM ClinicWithBookedHoursAndFeedbacksAndAvg as cwbhafaa
    LEFT JOIN NotAvailableDays as nad
    ON nad.doctorClinicId = cwbhafaa.id
    GROUP BY cwbhafaa.id,nad.doctorClinicId
    `;

    if (!DoctorClinic[0]) {
      console.log('alo');
    }

    return DoctorClinic[0];
  }
}
