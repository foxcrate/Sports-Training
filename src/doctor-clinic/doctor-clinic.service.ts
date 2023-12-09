import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { GlobalService } from 'src/global/global.service';
import { FreeSlots } from './dtos/free-slots.dto';
import { DoctorClinicModel } from './doctor-clinic.model';
import { DoctorClinicBookingDetailsDTO } from './dtos/doctorClinicBookingDetails.dto';
import { DoctorClinicCreateDto } from './dtos/create.dto';
import { DoctorClinicReturnDto } from './dtos/return.dto';
import { DoctorClinicUpdateDto } from './dtos/update.dto';
import * as moment from 'moment-timezone';

@Injectable()
export class DoctorClinicService {
  constructor(
    private doctorClinicModel: DoctorClinicModel,
    private readonly i18n: I18nService,
    private globalSerice: GlobalService,
  ) {}

  async getAll(): Promise<DoctorClinicBookingDetailsDTO[]> {
    return await this.doctorClinicModel.allDoctorClinics();
  }

  async getOne(id: number): Promise<DoctorClinicBookingDetailsDTO> {
    return await this.doctorClinicModel.getByID(id);
  }

  async create(
    userId: number,
    reqBody: DoctorClinicCreateDto,
  ): Promise<DoctorClinicReturnDto> {
    // check for repeated name;
    let repeatedDoctorClinc = await this.doctorClinicModel.getByName(reqBody.name);

    if (repeatedDoctorClinc) {
      throw new BadRequestException(
        this.i18n.t(`errors.REPEATED_DOCTOR_CLINIC`, {
          lang: I18nContext.current().lang,
        }),
      );
    }

    reqBody.availableWeekDays = JSON.stringify(reqBody.availableWeekDays);

    return await this.doctorClinicModel.createByUser(userId, reqBody);
  }

  async update(
    id: number,
    reqBody: DoctorClinicUpdateDto,
  ): Promise<DoctorClinicReturnDto> {
    // check for repeated name;
    let repeatedDoctorClinic = await this.doctorClinicModel.getByName(reqBody.name);

    if (repeatedDoctorClinic && repeatedDoctorClinic.id == id) {
      throw new BadRequestException(
        this.i18n.t(`errors.REPEATED_DOCTOR_CLINIC`, {
          lang: I18nContext.current().lang,
        }),
      );
    }
    reqBody.availableWeekDays = JSON.stringify(reqBody.availableWeekDays);

    return await this.doctorClinicModel.update(id, reqBody);
  }

  async delete(id: number): Promise<DoctorClinicBookingDetailsDTO> {
    let deletedClinic = await this.doctorClinicModel.getByID(id);

    Promise.all([
      await this.doctorClinicModel.deleteNotAvailableDays(id),
      await this.doctorClinicModel.deleteRates(id),
      await this.doctorClinicModel.deleteBookedHours(id),
    ]);
    await this.doctorClinicModel.deleteByID(id);
    return deletedClinic;
  }

  async doctorClinicDayAvailableHours(
    doctorClinicId: number,
    day: string,
  ): Promise<FreeSlots[]> {
    let doctorClinicExist = await this.doctorClinicModel.getByID(doctorClinicId);
    let dayDate = moment(day);

    let dateString = this.globalSerice.getDate(dayDate);
    let dayName = this.globalSerice.getDayName(dayDate);

    let theDoctorClinic =
      await this.doctorClinicModel.doctorClinicBookingDetailsForSpecificDate(
        doctorClinicId,
        dateString,
      );

    // throw error if date not available
    if (
      theDoctorClinic.doctorClinicNotAvailableDays &&
      theDoctorClinic.doctorClinicNotAvailableDays.length > 0
    ) {
      throw new BadRequestException(
        this.i18n.t(`errors.DAY_NOT_AVAILABLE`, {
          lang: I18nContext.current().lang,
        }),
      );
    }

    //throw error if week day not available
    this.checkWeekDayIsAvailable(theDoctorClinic.availableWeekDays, dayName);

    let doctorClinicBookedHours = theDoctorClinic.doctorClinicBookedHours
      ? theDoctorClinic.doctorClinicBookedHours
      : [];
    let mappedDoctorClinicBookedHours = doctorClinicBookedHours.map((i) => {
      return this.globalSerice.getLocalTime12(moment(i.fromDateTime));
    });

    let startTimeDate = `${dateString} ${theDoctorClinic.availableDayHours.from}`;
    let endTimeDate = `${dateString} ${theDoctorClinic.availableDayHours.to}`;

    let availableHours = this.getFreeSlots(
      mappedDoctorClinicBookedHours,
      startTimeDate,
      endTimeDate,
    );
    return availableHours;
  }

  async reserveSlot(doctorClinicId: number, userId: number, reqBody): Promise<string> {
    let doctorClinicExist = await this.doctorClinicModel.getByID(doctorClinicId);
    let dayDate = moment(reqBody.dayDate);
    let dateOnly = this.globalSerice.getDate(dayDate);
    let dayTimesArray = reqBody.dayTimes;

    let localDayTimes = dayTimesArray.map((i) =>
      moment(`${dateOnly}T${this.globalSerice.timeTo24(i)}`).format('HH:mm:ss'),
    );

    let dateString = this.globalSerice.getDate(dayDate);

    let theDoctorClinic =
      await this.doctorClinicModel.doctorClinicBookingDetailsForSpecificDate(
        doctorClinicId,
        dateString,
      );

    // throw error if date not available
    if (
      theDoctorClinic.doctorClinicNotAvailableDays &&
      theDoctorClinic.doctorClinicNotAvailableDays.length > 0
    ) {
      throw new BadRequestException(
        this.i18n.t(`errors.DAY_NOT_AVAILABLE`, {
          lang: I18nContext.current().lang,
        }),
      );
    }

    // throw error if week day not available
    this.checkWeekDayIsAvailable(
      theDoctorClinic.availableWeekDays,
      this.globalSerice.getDayName(dayDate),
    );

    let doctorClinicBookedHours = theDoctorClinic.doctorClinicBookedHours
      ? theDoctorClinic.doctorClinicBookedHours
      : [];

    let mappedDoctorClinicBookedHours = doctorClinicBookedHours.map((i) => {
      return moment(i.fromDateTime).format('HH:mm:ss');
    });

    for (let i = 0; i < localDayTimes.length; i++) {
      if (mappedDoctorClinicBookedHours.includes(localDayTimes[i])) {
        throw new BadRequestException(
          this.i18n.t(`errors.BOOKED_SLOT`, {
            lang: I18nContext.current().lang,
          }),
        );
      }
      if (
        !this.slotExistance(
          theDoctorClinic.availableDayHours.from,
          theDoctorClinic.availableDayHours.to,
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
      await this.doctorClinicModel.insertDoctorClinicBookedHour(
        doctorClinicId,
        userId,
        dateTime,
      );
    }

    return 'done';
  }

  private checkWeekDayIsAvailable(doctorClinicAvailableWeekDays, dayName) {
    if (!doctorClinicAvailableWeekDays.includes(dayName)) {
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
