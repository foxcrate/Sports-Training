import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { GlobalService } from 'src/global/global.service';
import { FieldModel } from './field.model';
import { FieldCreateDto } from './dtos/create.dto';
import { FieldUpdateDto } from './dtos/update.dto';
import { FieldBookingDetailsDTO } from './dtos/fieldBookingDetails.dto';
import { FieldReturnDto } from './dtos/return.dto';
import { FreeSlots } from './dtos/free-slots.dto';
import * as moment from 'moment-timezone';

@Injectable()
export class FieldService {
  constructor(
    private fieldModel: FieldModel,
    private readonly i18n: I18nService,
    private globalSerice: GlobalService,
  ) {}

  async getAll(): Promise<FieldBookingDetailsDTO[]> {
    return this.fieldModel.allFields();
  }

  async getOne(id: number): Promise<FieldBookingDetailsDTO> {
    return this.fieldModel.getByID(id);
  }

  async create(userId: number, reqBody: FieldCreateDto): Promise<FieldReturnDto> {
    // check for repeated name;
    let repeatedField = await this.fieldModel.getByName(reqBody.name);

    if (repeatedField) {
      throw new BadRequestException(
        this.i18n.t(`errors.REPEATED_FIELD`, { lang: I18nContext.current().lang }),
      );
    }

    reqBody.availableWeekDays = JSON.stringify(reqBody.availableWeekDays);

    return await this.fieldModel.createByUser(userId, reqBody);
  }

  async update(id: number, reqBody: FieldUpdateDto): Promise<FieldReturnDto> {
    // check for repeated name;
    let repeatedField = await this.fieldModel.getByName(reqBody.name);

    if (repeatedField && repeatedField.id == id) {
      throw new BadRequestException(
        this.i18n.t(`errors.REPEATED_FIELD`, { lang: I18nContext.current().lang }),
      );
    }
    reqBody.availableWeekDays = JSON.stringify(reqBody.availableWeekDays);

    return await this.fieldModel.update(id, reqBody);
  }

  async delete(id: number): Promise<FieldBookingDetailsDTO> {
    let deletedField = await this.fieldModel.getByID(id);
    this.fieldModel.deleteByID(id);
    return deletedField;
  }

  async fieldDayAvailableHours(fieldId: number, day: string): Promise<FreeSlots[]> {
    let dayDate = moment(day);

    let dateString = this.globalSerice.getDate(dayDate);
    let dayName = this.globalSerice.getDayName(dayDate);

    let theField = await this.fieldModel.fieldBookingDetailsForSpecificDate(
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
      return this.globalSerice.getLocalTime12(moment(i.fromDateTime));
    });

    let startTimeDate = `${dateString} ${theField.availableDayHours.from}`;
    let endTimeDate = `${dateString} ${theField.availableDayHours.to}`;

    let availableHours = this.getFreeSlots(
      mappedFieldBookedHours,
      startTimeDate,
      endTimeDate,
    );
    return availableHours;
  }

  async reserveSlot(fieldId: number, userId: number, reqBody): Promise<string> {
    let dayDate = moment(reqBody.dayDate);
    let dateOnly = this.globalSerice.getDate(dayDate);
    let dayTimesArray = reqBody.dayTimes;

    let localDayTimes = dayTimesArray.map((i) =>
      moment(`${dateOnly}T${this.globalSerice.timeTo24(i)}`).format('HH:mm:ss'),
    );

    let dateString = this.globalSerice.getDate(dayDate);

    let theField = await this.fieldModel.fieldBookingDetailsForSpecificDate(
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
      this.globalSerice.getDayName(dayDate),
    );

    let fieldBookedHours = theField.fieldBookedHours ? theField.fieldBookedHours : [];

    let mappedFieldBookedHours = fieldBookedHours.map((i) => {
      return moment(i.fromDateTime).format('HH:mm:ss');
    });

    for (let i = 0; i < localDayTimes.length; i++) {
      if (mappedFieldBookedHours.includes(localDayTimes[i])) {
        throw new BadRequestException(
          this.i18n.t(`errors.BOOKED_SLOT`, {
            lang: I18nContext.current().lang,
          }),
        );
      }
      if (
        !this.slotExistance(
          theField.availableDayHours.from,
          theField.availableDayHours.to,
          localDayTimes[i],
        )
      ) {
        throw new BadRequestException(
          this.i18n.t(`errors.NOT_EXISTED_SLOT`, {
            lang: I18nContext.current().lang,
          }),
        );
      }
      let dateTime = `${dateString} ${localDayTimes[i]}`;
      await this.fieldModel.insertFieldBookedHour(fieldId, userId, dateTime);
    }

    return 'done';
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
    startTimeDate = moment(startTimeDate);
    endTimeDate = moment(endTimeDate);

    while (startTimeDate < endTimeDate) {
      let endOfSlot = moment(startTimeDate);
      endOfSlot.add(1, 'hours');

      let timeSlotAvailable = this.getSlotState(
        mappedFieldBookedHours,
        this.globalSerice.getLocalTime12(startTimeDate),
      );
      availableHours.push({
        from: this.globalSerice.getLocalTime12(startTimeDate),
        to: this.globalSerice.getLocalTime12(endOfSlot),
        state: timeSlotAvailable,
      });

      startTimeDate.add(1, 'hours');
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

    startTimeDate = moment(`2000-01-01T${startTimeDate}`);
    endTimeDate = moment(`2000-01-01T${endTimeDate}`);

    while (startTimeDate < endTimeDate) {
      let endOfSlot = moment(startTimeDate);
      endOfSlot.add(1, 'hours');
      availableHours.push(startTimeDate.format('HH:mm:ss'));
      startTimeDate.add(1, 'hours');
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
