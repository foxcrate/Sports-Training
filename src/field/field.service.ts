import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { GlobalService } from 'src/global/global.service';
import { FieldRepository } from './field.repository';
import { FieldCreateDto } from './dtos/create.dto';
import { FieldUpdateDto } from './dtos/update.dto';
import { FieldBookingDetailsDTO } from './dtos/fieldBookingDetails.dto';
import { FieldReturnDto } from './dtos/return.dto';
import { FreeSlots } from './dtos/free-slots.dto';
import moment from 'moment-timezone';
import { FieldCardFormatDto } from './dtos/field-card-format.dto';
import { GetAllFilterDto } from './dtos/get-all-filter.dto';

@Injectable()
export class FieldService {
  constructor(
    private fieldRepository: FieldRepository,
    private readonly i18n: I18nService,
    private globalSerice: GlobalService,
  ) {}

  async getAll(filter: GetAllFilterDto): Promise<FieldBookingDetailsDTO[]> {
    return this.fieldRepository.allFields(filter);
  }

  async getOne(id: number): Promise<FieldBookingDetailsDTO> {
    return this.fieldRepository.getByID(id);
  }

  async create(userId: number, reqBody: FieldCreateDto): Promise<FieldReturnDto> {
    // check for repeated name;
    let repeatedField = await this.fieldRepository.getByName(reqBody.name);

    if (repeatedField) {
      throw new BadRequestException(
        this.i18n.t(`errors.REPEATED_FIELD`, { lang: I18nContext.current().lang }),
      );
    }

    // reqBody.availableWeekDays = JSON.stringify(reqBody.availableWeekDays);
    reqBody.startTime = this.globalSerice.timeTo24(reqBody.startTime);
    reqBody.endTime = this.globalSerice.timeTo24(reqBody.endTime);

    return await this.fieldRepository.createByUser(userId, reqBody);
  }

  async update(id: number, reqBody: FieldUpdateDto): Promise<FieldReturnDto> {
    // check for repeated name;
    let repeatedField = await this.fieldRepository.getByName(reqBody.name);

    if (repeatedField && repeatedField.id == id) {
      throw new BadRequestException(
        this.i18n.t(`errors.REPEATED_FIELD`, { lang: I18nContext.current().lang }),
      );
    }
    reqBody.availableWeekDays = JSON.stringify(reqBody.availableWeekDays);

    return await this.fieldRepository.update(id, reqBody);
  }

  async delete(id: number): Promise<FieldBookingDetailsDTO> {
    let deletedField = await this.fieldRepository.getByID(id);

    Promise.all([
      await this.fieldRepository.deleteSlots(id),
      await this.fieldRepository.deleteRates(id),
      await this.fieldRepository.deleteNotAvailableDays(id),
      await this.fieldRepository.deleteBookedHours(id),
      await this.fieldRepository.deleteTrainerProfileFields(id),
    ]);

    this.fieldRepository.deleteByID(id);
    return deletedField;
  }

  async availableUpcomingWeek(id: number) {
    let theField = await this.fieldRepository.getByID(id);
    let availableDays = [];

    let endDate = moment().endOf('week');

    let toDay = moment();

    while (toDay < endDate) {
      let dayName = toDay.format('dddd');

      if (theField.availableWeekDays.includes(dayName)) {
        availableDays.push(moment(toDay).format('YYYY-MM-DD'));
      }

      toDay.add(1, 'days');
    }

    if (theField.fieldNotAvailableDays) {
      let arrayOfNotAvailableDays = theField.fieldNotAvailableDays.map((i) => {
        return moment(i.dayDate).format('YYYY-MM-DD');
      });

      availableDays = this.getFieldRealAvailableDays(
        availableDays,
        arrayOfNotAvailableDays,
      );
    }

    return availableDays;
  }

  async fieldDayAvailableHours(
    userId: number,
    fieldId: number,
    day: string,
  ): Promise<FreeSlots[]> {
    await this.fieldRepository.getByID(fieldId);
    let dayDate = moment(day);

    let dateString = this.globalSerice.getDate(dayDate);
    let dayName = this.globalSerice.getDayName(dayDate);

    let theField = await this.fieldRepository.fieldBookingDetailsForSpecificDate(
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
    // console.log({ mappedFieldBookedHours });

    //get user booked hours
    let userBookedHours = await this.fieldRepository.getUserBookedHours(
      userId,
      dateString,
    );

    if (userBookedHours) {
      let mappedUserBookedHours = userBookedHours.map((i) => {
        return this.globalSerice.getLocalTime12(moment(i));
      });
      mappedFieldBookedHours.push(...mappedUserBookedHours);
    }

    let startTimeDate = `${dateString} ${theField.availableDayHours.from}`;
    let endTimeDate = `${dateString} ${theField.availableDayHours.to}`;

    let availableHours = this.getFreeSlots(
      mappedFieldBookedHours,
      startTimeDate,
      endTimeDate,
    );
    return availableHours;
  }

  async reserveSlot(
    fieldId: number,
    userId: number,
    reqBody,
  ): Promise<FieldCardFormatDto> {
    await this.fieldRepository.getByID(fieldId);
    let dayDate = moment(reqBody.dayDate);
    let dateOnly = this.globalSerice.getDate(dayDate);
    let dayTimesArray = reqBody.dayTimes;

    let localDayTimes = dayTimesArray.map((i) =>
      moment(`${dateOnly}T${this.globalSerice.timeTo24(i)}`).format('HH:mm:ss'),
    );

    let dateString = this.globalSerice.getDate(dayDate);

    let theField = await this.fieldRepository.fieldBookingDetailsForSpecificDate(
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

    //get user booked hours
    let userBookedHours = await this.fieldRepository.getUserBookedHours(userId, dateOnly);

    if (userBookedHours) {
      let mappedUserBookedHours = userBookedHours.map((i) => {
        return moment(i).format('HH:mm:ss');
      });
      mappedFieldBookedHours.push(...mappedUserBookedHours);
    }

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
      await this.fieldRepository.insertFieldBookedHour(fieldId, userId, dateTime);

      let bookedSession = await this.fieldRepository.getFieldBookedHour(
        fieldId,
        userId,
        dateTime,
      );

      return bookedSession;
    }
  }

  // comparing field-available-days with field-not-available-days
  private getFieldRealAvailableDays(
    fieldAvailableDays: string[],
    fieldNotAvailableDays: string[],
  ): string[] {
    let updatedAvailableDays = [];

    fieldAvailableDays.forEach((element) => {
      if (!fieldNotAvailableDays.includes(element)) {
        updatedAvailableDays.push(element);
      }
    });
    return updatedAvailableDays;
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
