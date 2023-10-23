import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { GlobalService } from 'src/global/global.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { FieldSQLService } from './field-sql.service';
import { FieldBookingDetailsDTO } from './dtos/fieldBookingDetails.dto';
import { FieldCreateDto } from './dtos/create';

@Injectable()
export class FieldService {
  constructor(
    private prisma: PrismaService,
    private fieldSQLService: FieldSQLService,
    private readonly i18n: I18nService,
    private globalSerice: GlobalService,
  ) {}

  async getAll(): Promise<any> {
    return this.fieldSQLService.allFields();
  }

  async getOne(id: number): Promise<any> {
    return this.fieldSQLService.getByID(id);
  }

  async create(reqBody: FieldCreateDto): Promise<any> {
    // check for repeated name;
    let repeatedField = await this.fieldSQLService.getByName(reqBody.name);

    if (repeatedField) {
      throw new BadRequestException(
        this.i18n.t(`errors.REPEATED_FIELD`, { lang: I18nContext.current().lang }),
      );
    }

    reqBody.availableWeekDays = JSON.stringify(reqBody.availableWeekDays);

    await this.fieldSQLService.create(reqBody);
    return 'Done';
  }

  async update(id: number): Promise<any> {}

  async delete(id: number): Promise<any> {
    let deletedField = await this.fieldSQLService.getByID(id);
    this.fieldSQLService.deleteByID(id);
    return deletedField;
  }

  async fieldDayAvailableHours(fieldId: number, day: string): Promise<any> {
    let dayDate = new Date(day);
    let dateString = `${dayDate.getFullYear()}-${
      dayDate.getMonth() + 1
    }-${dayDate.getDate()}`;
    let dayName = this.globalSerice.getDayName(dayDate.getDay());
    let theField = await this.fieldSQLService.fieldBookingDetailsForSpecificDate(
      fieldId,
      dateString,
    );

    // throw error if date not available
    if (theField.fieldNotAvailableDays && theField.fieldNotAvailableDays.length > 0) {
      throw new BadRequestException(
        this.i18n.t(`errors.DAY_NOT_AVAILABLE`, {
          lang: I18nContext.current().lang,
        }),
      );
    }

    //throw error if week day not available
    this.checkWeekDayIsAvailable(theField.availableWeekDays, dayName);

    let fieldBookedHours = theField.fieldBookedHours ? theField.fieldBookedHours : [];
    let mappedFieldBookedHours = fieldBookedHours.map((i) => {
      return new Date(i.fromDateTime).toLocaleTimeString();
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

  async reserveSlot(fieldId: number, userId: number, reqBody: any): Promise<any> {
    let dayDate = new Date(reqBody.dayDate);
    let dayTime: any;
    let theTime = this.globalSerice.timeTo24(reqBody.dayTime);
    dayTime = new Date(`2000-01-01T${theTime}`);

    let localDayTime = this.globalSerice.getLocalTime(dayTime);

    let dateString = this.globalSerice.getDate(dayDate);

    let theField = await this.fieldSQLService.fieldBookingDetailsForSpecificDate(
      fieldId,
      dateString,
    );

    // throw error if date not available
    if (theField.fieldNotAvailableDays && theField.fieldNotAvailableDays.length > 0) {
      throw new BadRequestException(
        this.i18n.t(`errors.DAY_NOT_AVAILABLE`, {
          lang: I18nContext.current().lang,
        }),
      );
    }

    // throw error if week day not available
    this.checkWeekDayIsAvailable(
      theField.availableWeekDays,
      this.globalSerice.getDayName(dayDate.getDay()),
    );

    let fieldBookedHours = theField.fieldBookedHours ? theField.fieldBookedHours : [];

    let mappedFieldBookedHours = fieldBookedHours.map((i) => {
      return this.globalSerice.getLocalTime(new Date(i.fromDateTime));
    });

    if (mappedFieldBookedHours.includes(localDayTime)) {
      throw new BadRequestException(
        this.i18n.t(`errors.BOOKED_SLOT`, {
          lang: I18nContext.current().lang,
        }),
      );
    }

    if (
      this.slotExistance(
        theField.availableDayHours.from,
        theField.availableDayHours.to,
        localDayTime,
      )
    ) {
      let dateTime = `${dateString} ${localDayTime}`;
      await this.fieldSQLService.insertFieldBookedHour(fieldId, userId, dateTime);
      return 'done';
    } else {
      return 'not found';
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

  private slotExistance(from, to, slotTime): boolean {
    let allSlots = this.getAllSlots(from, to);

    if (!allSlots.includes(slotTime)) {
      return false;
    } else {
      return true;
    }
  }

  private getFreeSlots(mappedFieldBookedHours, startTimeDate, endTimeDate) {
    let availableHours = [];

    startTimeDate = new Date(startTimeDate);
    endTimeDate = new Date(endTimeDate);

    while (startTimeDate < endTimeDate) {
      let endOfSlot = new Date(startTimeDate);
      endOfSlot.setHours(startTimeDate.getHours() + 1);

      let timeSlotAvailable = this.getSlotState(
        mappedFieldBookedHours,
        startTimeDate.toLocaleTimeString(),
      );
      availableHours.push({
        from: startTimeDate.toLocaleTimeString('en-US', { hour12: true }),
        to: endOfSlot.toLocaleTimeString('en-US', { hour12: true }),
        state: timeSlotAvailable,
      });
      startTimeDate.setHours(startTimeDate.getHours() + 1);
    }

    return availableHours;
  }

  private getSlotState(bookedHoursArray, desiredStartTime) {
    if (bookedHoursArray.includes(desiredStartTime)) {
      return false;
    } else {
      return true;
    }
  }

  private getAllSlots(startTimeDate, endTimeDate) {
    let availableHours = [];

    startTimeDate = new Date(`2000-01-01T${startTimeDate}`);
    endTimeDate = new Date(`2000-01-01T${endTimeDate}`);

    while (startTimeDate < endTimeDate) {
      let endOfSlot = new Date(startTimeDate);
      endOfSlot.setHours(startTimeDate.getHours() + 1);

      availableHours.push(this.globalSerice.getLocalTime(startTimeDate));

      startTimeDate.setHours(startTimeDate.getHours() + 1);
    }
    return availableHours;
  }
}

// new Date(dayDate).toLocaleDateString()
// let fieldWorkingFromHour = new Date(
//   `2020-10-10T${theField[0].availableDayHours.from}`,
// ).toTimeString();

// let dateNow = new Date();
// dateNow.setHours(dateNow.getHours() + 1);
// TIME_FORMAT(f.availableDayHours->>"$.to", '%H:%i') AS toTime,
// ${fromTimeToCheck} BETWEEN fbh.fromDateTime AND fbh.toDateTime
// TIME_FORMAT(availableDayHours->>"$.to", '%H:%i:%s') AS testTime,
