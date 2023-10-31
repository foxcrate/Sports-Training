import { BadRequestException, Injectable } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { GlobalService } from 'src/global/global.service';
import { FieldModel } from './field.model';
import { FieldCreateDto } from './dtos/create.dto';
import { FieldUpdateDto } from './dtos/update.dto';
import { FieldAcceptanceStatusDto } from './dtos/field-acceptance-status.dto';
import { FieldBookingDetailsDTO } from './dtos/fieldBookingDetails.dto';
import { FieldReturnDto } from './dtos/return.dto';
import { FreeSlots } from './dtos/free-slots.dto';

@Injectable()
export class AdminFieldService {
  constructor(
    private fieldModel: FieldModel,
    private readonly i18n: I18nService,
    private globalSerice: GlobalService,
  ) {}

  async getAll(): Promise<FieldBookingDetailsDTO[]> {
    return await this.fieldModel.allFields();
  }

  async getOne(id: number): Promise<FieldBookingDetailsDTO> {
    return await this.fieldModel.getByID(id);
  }

  async create(reqBody: FieldCreateDto): Promise<FieldReturnDto> {
    // check for repeated name;
    let repeatedField = await this.fieldModel.getByName(reqBody.name);

    if (repeatedField) {
      throw new BadRequestException(
        this.i18n.t(`errors.REPEATED_FIELD`, { lang: I18nContext.current().lang }),
      );
    }

    reqBody.availableWeekDays = JSON.stringify(reqBody.availableWeekDays);

    return await this.fieldModel.create(reqBody);
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

  async getPendingFields(): Promise<FieldBookingDetailsDTO[]> {
    let pendingField = await this.fieldModel.selectPendingFields();
    return pendingField;
  }

  async changeFieldAcceptanceStatue(
    fieldId: number,
    newStatus: FieldAcceptanceStatusDto,
  ): Promise<Boolean> {
    let theField = await this.fieldModel.getByID(fieldId);
    if (theField.acceptanceStatus != FieldAcceptanceStatusDto.Pending) {
      throw new BadRequestException(
        this.i18n.t(`errors.FIELD_NOT_PENDING`, { lang: I18nContext.current().lang }),
      );
    }
    return await this.fieldModel.setFieldAcceptanceStatue(fieldId, newStatus);
  }

  async addNotAvailableDays(fieldId: number, datesArray: string[]) {
    return await this.fieldModel.insertNotAvailableDays(fieldId, datesArray);
  }

  async fieldDayAvailableHours(fieldId: number, day: string): Promise<FreeSlots[]> {
    let dayDate = new Date(day);
    let dateString = `${dayDate.getFullYear()}-${
      dayDate.getMonth() + 1
    }-${dayDate.getDate()}`;
    let dayName = this.globalSerice.getDayName(dayDate.getDay());
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
      return new Date(i.fromDateTime).toLocaleTimeString();
    });

    let fieldStartHour = theField.availableDayHours.from;
    let fieldEndHour = theField.availableDayHours.to;

    let startTimeDate = new Date(`${dayDate.toLocaleDateString()} ${fieldStartHour}`);
    let endTimeDate = new Date(`${dayDate.toLocaleDateString()} ${fieldEndHour}`);
    let availableHours: FreeSlots[] = this.getFreeSlots(
      mappedFieldBookedHours,
      startTimeDate,
      endTimeDate,
    );
    return availableHours;
  }

  async reserveSlot(fieldId: number, userId: number, reqBody): Promise<string> {
    let dayDate = new Date(reqBody.dayDate);
    let theTime = this.globalSerice.timeTo24(reqBody.dayTime);
    let dayTime = new Date(`2000-01-01T${theTime}`);

    let localDayTime = this.globalSerice.getLocalTime(dayTime);

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
      await this.fieldModel.insertFieldBookedHour(fieldId, userId, dateTime);
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

  private getFreeSlots(mappedFieldBookedHours, startTimeDate, endTimeDate): FreeSlots[] {
    let availableHours: FreeSlots[] = [];

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

  private getSlotState(bookedHoursArray, desiredStartTime): boolean {
    if (bookedHoursArray.includes(desiredStartTime)) {
      return false;
    } else {
      return true;
    }
  }

  private getAllSlots(startTimeDate, endTimeDate): string[] {
    let availableHours: string[] = [];

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
