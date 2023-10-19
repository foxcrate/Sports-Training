import { BadRequestException, Injectable } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { GlobalService } from 'src/global/global.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { FieldSQLService } from './field-sql.service';
import { FieldBookingDetailsDTO } from './dtos/fieldBookingDetails.dto';

@Injectable()
export class FieldService {
  constructor(
    private prisma: PrismaService,
    private fieldSQLService: FieldSQLService,
    private readonly i18n: I18nService,
    private globalSerice: GlobalService,
  ) {}

  async fieldDayAvailableHours(fieldId: number, day: string): Promise<any> {
    let dayDate = new Date(day);

    let dateString = `${dayDate.getFullYear()}-${
      dayDate.getMonth() + 1
    }-${dayDate.getDate()}`;

    let dayName = this.globalSerice.getDayName(dayDate.getDay());

    let theField = await this.fieldSQLService.fieldBookingDetails(fieldId);

    let fieldNotAvailableDaysArray = theField.fieldNotAvailableDays
      ? theField.fieldNotAvailableDays.split(',')
      : [];

    //throw error if date not available
    this.checkDateIsAvailable(fieldNotAvailableDaysArray, dateString);

    //throw error if week day not available
    this.checkWeekDayIsAvailable(theField.availableWeekDays, dayName);

    let fieldBookedHours = theField.fieldBookedHours ? theField.fieldBookedHours : [];
    console.log({ fieldBookedHours });

    let mappedFieldBookedHours = fieldBookedHours.map((i) => {
      return {
        from: new Date(i.fromDateTime),
        to: new Date(i.toDateTime),
      };
    });

    let fieldStartHour = theField.availableDayHours.from;
    let fieldEndHour = theField.availableDayHours.to;

    let startTimeDate = new Date(`${dayDate.toLocaleDateString()} ${fieldStartHour}`);
    let endTimeDate = new Date(`${dayDate.toLocaleDateString()} ${fieldEndHour}`);

    let availableHours = this.getFreeSlots(
      mappedFieldBookedHours,
      startTimeDate,
      endTimeDate,
    );

    return availableHours;
  }

  private checkDateIsAvailable(fieldNotAvailableDaysArray, dateString) {
    if (fieldNotAvailableDaysArray.includes(dateString)) {
      throw new BadRequestException(
        this.i18n.t(`errors.DAY_NOT_AVAILABLE`, {
          lang: I18nContext.current().lang,
        }),
      );
    }
  }

  private checkWeekDayIsAvailable(fieldAvailableWeekDays, dayName) {
    if (!fieldAvailableWeekDays.includes(dayName)) {
      throw new BadRequestException(
        this.i18n.t(`errors.WEEK_DAY_NOT_AVAILABLE`, {
          lang: I18nContext.current().lang,
        }),
      );
    }
  }

  private getFreeSlots(mappedFieldBookedHours, startTimeDate, endTimeDate) {
    let availableHours = [];

    startTimeDate = new Date(startTimeDate);
    endTimeDate = new Date(endTimeDate);

    while (startTimeDate < endTimeDate) {
      let timeSlotAvailable = this.checkFieldAvailable(
        mappedFieldBookedHours,
        startTimeDate,
      );
      let endOfSlot = new Date(startTimeDate);
      endOfSlot.setHours(startTimeDate.getHours() + 1);
      // if (timeSlotAvailable) {
      availableHours.push({
        from: startTimeDate,
        to: endOfSlot,
      });
      // }
      startTimeDate.setHours(startTimeDate.getHours() + 1);
    }
    console.log({ availableHours });
    console.log({ mappedFieldBookedHours });

    // for (let i = 0; i < availableHours.length; i++) {
    //   const element = availableHours[i];

    // }

    return availableHours;
  }

  private checkFieldAvailable(bookedHoursArray, desiredStartTime) {
    let availableStatusArray = [];

    for (let i = 0; i < bookedHoursArray.length; i++) {
      let x = this.globalSerice.isTimeAvailable(
        bookedHoursArray[i].from,
        bookedHoursArray[i].to,
        desiredStartTime,
      );
      availableStatusArray.push(x);
    }

    if (availableStatusArray.includes(false)) {
      return false;
    } else {
      return true;
    }
  }

  // async checkFieldAvailability(fieldId, fromTimeToCheck, toTimeToCheck): Promise<any> {
  //   let theField = await this.prisma.$queryRaw`
  //   SELECT
  //     f.id AS id,
  //     f.name AS name,
  //     f.availableWeekDays AS availableWeekDays,
  //     TIME_FORMAT(f.availableDayHours->>"$.from", '%H:%i') AS fromTime,
  //     TIME_FORMAT(f.availableDayHours->>"$.to", '%H:%i') AS toTime,
  //     f.createdAt AS createdAt,
  //     CASE
  //     WHEN COUNT(fbh.id ) = 0 THEN null
  //     ELSE
  //     JSON_ARRAYAGG(JSON_OBJECT(
  //       'id',fbh.id,
  //       'fromDateTime', fbh.fromDateTime,
  //       'toDateTime', fbh.toDateTime,
  //       'userId',fbh.userId
  //       ))
  //     END AS FieldBookedHours
  //     FROM Field AS f
  //     LEFT JOIN FieldsBookedHours AS fbh ON f.id = fbh.fieldId
  //     -- WHERE f.id = fieldId
  //     GROUP BY f.id
  //   `;

  //   console.log(theField[0].availableWeekDays);
  //   console.log(theField[0].fromTime);
  //   console.log(theField[0].toTime);
  //   console.log(theField[0].FieldBookedHours);

  //   //check field booked hours

  //   let foundedBookedHours = await this.prisma.$queryRaw`
  //     SELECT
  //     *
  //     FROM FieldsBookedHours AS fbh
  //     WHERE
  //     ${fromTimeToCheck} BETWEEN fbh.fromDateTime AND fbh.toDateTime
  //     OR
  //     ${toTimeToCheck} BETWEEN fbh.fromDateTime AND fbh.toDateTime
  //   `;

  //   // if (foundedBookedHours[0]) {
  //   //   console.log(foundedBookedHours);

  //   //   return false;
  //   // } else {
  //   //   console.log(foundedBookedHours[0]);
  //   //   return true;
  //   // }
  //   //check working days

  //   //check working hours

  //   return theField;
  // }

  // async test(): Promise<any> {
  //   let firstField = await this.prisma.$queryRaw`
  //   SELECT
  //   id,
  //   name,
  //   availableWeekDays,
  //   availableDayHours,
  //   TIME_FORMAT(availableDayHours->>"$.to", '%H:%i:%s') AS testTime,
  //   createdAt,
  //   updatedAt
  //   FROM Field
  //   GROUP BY id;
  // `;

  //   return firstField;
  // }

  // async test2(): Promise<any> {
  //   let allFields = await this.prisma.$queryRaw`
  //  SELECT
  //   f.id AS id,
  //   f.name AS name,
  //   f.availableWeekDays AS availableWeekDays,
  //   TIME_FORMAT(f.availableDayHours->>"$.from", '%H:%i') AS fromTime,
  //   TIME_FORMAT(f.availableDayHours->>"$.to", '%H:%i') AS toTime,
  //   f.createdAt AS createdAt,
  //   CASE
  //   WHEN COUNT(fbh.id ) = 0 THEN null
  //   ELSE
  //   JSON_ARRAYAGG(JSON_OBJECT(
  //     'id',fbh.id,
  //     'fromDateTime', fbh.fromDateTime,
  //     'toDateTime', fbh.toDateTime,
  //     'userId',fbh.userId
  //     ))
  //   END AS FieldBookedHours
  //   FROM Field AS f
  //   LEFT JOIN FieldsBookedHours AS fbh ON f.id = fbh.fieldId
  //   GROUP BY f.id
  // `;

  //   return allFields;
  // }
}

// new Date(dayDate).toLocaleDateString()
// let fieldWorkingFromHour = new Date(
//   `2020-10-10T${theField[0].availableDayHours.from}`,
// ).toTimeString();

// let dateNow = new Date();
// dateNow.setHours(dateNow.getHours() + 1);
