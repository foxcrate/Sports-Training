import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { GlobalService } from 'src/global/global.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FieldService {
  constructor(
    private prisma: PrismaService,
    private readonly i18n: I18nService,
    private globalSerice: GlobalService,
  ) {}

  async test(): Promise<any> {
    let firstField = await this.prisma.$queryRaw`
    SELECT
    id,
    name,
    availableWeekDays,
    availableDayHours,
    TIME_FORMAT(availableDayHours->>"$.to", '%H:%i:%s') AS testTime,
    createdAt,
    updatedAt
    FROM Field
    GROUP BY id;
  `;

    return firstField;
  }

  async test2(): Promise<any> {
    let allFields = await this.prisma.$queryRaw`
   SELECT
    f.id AS id,
    f.name AS name,
    f.availableWeekDays AS availableWeekDays,
    TIME_FORMAT(f.availableDayHours->>"$.from", '%H:%i') AS fromTime,
    TIME_FORMAT(f.availableDayHours->>"$.to", '%H:%i') AS toTime,
    f.createdAt AS createdAt,
    CASE 
    WHEN COUNT(fbh.id ) = 0 THEN null
    ELSE
    JSON_ARRAYAGG(JSON_OBJECT(
      'id',fbh.id,
      'fromDateTime', fbh.fromDateTime,
      'toDateTime', fbh.toDateTime,
      'userId',fbh.userId
      )) 
    END AS FieldBookedHours
    FROM Field AS f
    LEFT JOIN FieldsBookedHours AS fbh ON f.id = fbh.fieldId
    GROUP BY f.id
  `;

    return allFields;
  }

  async fieldDayAvailableHours(x): Promise<any> {
    let dayDate = new Date(x);
    let theField = await this.prisma.$queryRaw`
    SELECT
      f.id AS id,
      f.name AS name,
      f.availableWeekDays AS availableWeekDays,
      f.availableDayHours AS availableDayHours,
      f.createdAt AS createdAt,
      CASE 
      WHEN COUNT(fbh.id ) = 0 THEN null
      ELSE
      JSON_ARRAYAGG( JSON_OBJECT(
        'id',fbh.id,
        'fromDateTime', fbh.fromDateTime,
        'toDateTime', fbh.toDateTime,
        'userId',fbh.userId
        )) 
      END AS FieldBookedHours,
      GROUP_CONCAT(DISTINCT STR_TO_DATE(fnad.dayDate,'%Y-%m-%d') ) AS FieldNotAvailableDays
      -- CASE 
      -- WHEN COUNT(fnad.id ) = 0 THEN null
      -- ELSE
      -- JSON_ARRAYAGG(JSON_OBJECT(
      --   'id',fnad.id,
      --   'dayDate', fnad.dayDate,
      --   'fieldId',fnad.fieldId
      --   )) 
      -- END AS FieldNotAvailableDays
      FROM Field AS f
      JOIN FieldNotAvailableDays AS fnad ON f.id = fnad.fieldId
      JOIN FieldsBookedHours AS fbh ON f.id = fbh.fieldId
      WHERE f.id = 1
      GROUP BY f.id
    `;

    let FieldNotAvailableDaysArray = theField[0].FieldNotAvailableDays.split(',');

    let fieldBookedHours = theField[0].FieldBookedHours;

    // console.log({ fieldBookedHours });

    //map fieldBookedHours to pass to checkFieldAvailable()
    let mappedFieldBookedHours = fieldBookedHours.map((i) => {
      return {
        from: i.fromDateTime,
        to: i.toDateTime,
      };
    });

    console.log({ mappedFieldBookedHours });

    let b = this.checkFieldAvailable(mappedFieldBookedHours, '2023-10-17 01:00');

    // console.log({ b });

    let fieldStartHour = theField[0].availableDayHours.from;
    let fieldEndHour = theField[0].availableDayHours.to;

    console.log({ fieldStartHour });
    let startTimeDate = new Date(`${dayDate.toLocaleDateString()} ${fieldStartHour}`);
    console.log({ startTimeDate });

    console.log({ dayDate });

    console.log({ fieldEndHour });
    let endTimeDate = new Date(`${dayDate.toLocaleDateString()} ${fieldEndHour}`);
    console.log({ endTimeDate });

    console.log('--------');

    // let availableHours = [];

    // while (startTimeDate < endTimeDate) {
    //   console.log(startTimeDate.toLocaleTimeString());
    //   let timeSlotAvailable = this.checkFieldAvailable(
    //     mappedFieldBookedHours,
    //     startTimeDate,
    //   );
    //   let endOfSlot = new Date(startTimeDate);
    //   endOfSlot.setHours(startTimeDate.getHours() + 1);
    //   if (timeSlotAvailable) {
    //     availableHours.push({
    //       from: startTimeDate.toLocaleTimeString(),
    //       to: endOfSlot.toLocaleTimeString(),
    //     });
    //   }
    //   console.log({ timeSlotAvailable });
    //   startTimeDate.setHours(startTimeDate.getHours() + 1);
    // }

    let availableHours = this.getFreeSlots(
      mappedFieldBookedHours,
      startTimeDate,
      endTimeDate,
    );

    console.log('--------');
    console.log({ availableHours });

    return theField;
  }

  getFreeSlots(mappedFieldBookedHours, startTimeDate, endTimeDate) {
    let availableHours = [];

    startTimeDate = new Date(startTimeDate);
    endTimeDate = new Date(endTimeDate);

    while (startTimeDate < endTimeDate) {
      console.log(startTimeDate.toLocaleTimeString());
      let timeSlotAvailable = this.checkFieldAvailable(
        mappedFieldBookedHours,
        startTimeDate,
      );
      let endOfSlot = new Date(startTimeDate);
      endOfSlot.setHours(startTimeDate.getHours() + 1);
      if (timeSlotAvailable) {
        availableHours.push({
          from: startTimeDate.toLocaleTimeString(),
          to: endOfSlot.toLocaleTimeString(),
        });
      }
      console.log({ timeSlotAvailable });
      startTimeDate.setHours(startTimeDate.getHours() + 1);
    }
    return availableHours;
  }

  checkFieldAvailable(bookedHoursArray, desiredStartTime) {
    // let bookedHoursArray = [
    //   {
    //     from: '09:00',
    //     to: '10:00',
    //   },
    //   {
    //     from: '12:00',
    //     to: '12:30',
    //   },
    //   {
    //     from: '01:00',
    //     to: '02:00',
    //   },
    //   {
    //     from: '02:00',
    //     to: '04:00',
    //   },
    //   {
    //     from: '06:00',
    //     to: '08:00',
    //   },
    // ];

    let availableStatusArray = [];

    for (let i = 0; i < bookedHoursArray.length; i++) {
      // console.log('form:', bookedHoursArray[i].from);
      // console.log('to:', bookedHoursArray[i].to);

      let x = this.globalSerice.isTimeAvailable(
        bookedHoursArray[i].from,
        bookedHoursArray[i].to,
        desiredStartTime,
      );
      availableStatusArray.push(x);
      // console.log({ x });
    }

    // console.log({ availableStatusArray });

    if (availableStatusArray.includes(false)) {
      return false;
    } else {
      return true;
    }
  }

  async checkFieldAvailability(fieldId, fromTimeToCheck, toTimeToCheck): Promise<any> {
    let theField = await this.prisma.$queryRaw`
    SELECT
      f.id AS id,
      f.name AS name,
      f.availableWeekDays AS availableWeekDays,
      TIME_FORMAT(f.availableDayHours->>"$.from", '%H:%i') AS fromTime,
      TIME_FORMAT(f.availableDayHours->>"$.to", '%H:%i') AS toTime,
      f.createdAt AS createdAt,
      CASE 
      WHEN COUNT(fbh.id ) = 0 THEN null
      ELSE
      JSON_ARRAYAGG(JSON_OBJECT(
        'id',fbh.id,
        'fromDateTime', fbh.fromDateTime,
        'toDateTime', fbh.toDateTime,
        'userId',fbh.userId
        )) 
      END AS FieldBookedHours
      FROM Field AS f
      LEFT JOIN FieldsBookedHours AS fbh ON f.id = fbh.fieldId
      -- WHERE f.id = fieldId
      GROUP BY f.id
    `;

    console.log(theField[0].availableWeekDays);
    console.log(theField[0].fromTime);
    console.log(theField[0].toTime);
    console.log(theField[0].FieldBookedHours);

    //check field booked hours

    let foundedBookedHours = await this.prisma.$queryRaw`
      SELECT
      *
      FROM FieldsBookedHours AS fbh
      WHERE
      ${fromTimeToCheck} BETWEEN fbh.fromDateTime AND fbh.toDateTime
      OR
      ${toTimeToCheck} BETWEEN fbh.fromDateTime AND fbh.toDateTime
    `;

    // if (foundedBookedHours[0]) {
    //   console.log(foundedBookedHours);

    //   return false;
    // } else {
    //   console.log(foundedBookedHours[0]);
    //   return true;
    // }
    //check working days

    //check working hours

    return theField;
  }
}

// new Date(dayDate).toLocaleDateString()
// let fieldWorkingFromHour = new Date(
//   `2020-10-10T${theField[0].availableDayHours.from}`,
// ).toTimeString();

// let dateNow = new Date();
// dateNow.setHours(dateNow.getHours() + 1);
