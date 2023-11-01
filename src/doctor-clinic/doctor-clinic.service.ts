import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { GlobalService } from 'src/global/global.service';
import { FreeSlots } from './dtos/free-slots.dto';
import { DoctorClinicModel } from './doctor-clinic.model';
import { DoctorClinicBookingDetailsDTO } from './dtos/doctorClinicBookingDetails.dto';
import { DoctorClinicCreateDto } from './dtos/create.dto';
import { DoctorClinicReturnDto } from './dtos/return.dto';
import { DoctorClinicUpdateDto } from './dtos/update.dto';

@Injectable()
export class DoctorClinicService {
  constructor(
    private doctorClinicModel: DoctorClinicModel,
    private readonly i18n: I18nService,
    private globalSerice: GlobalService,
  ) {}

  async getAll(): Promise<DoctorClinicBookingDetailsDTO[]> {
    return this.doctorClinicModel.allDoctorClinics();
  }

  async getOne(id: number): Promise<DoctorClinicBookingDetailsDTO> {
    return this.doctorClinicModel.getByID(id);
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
    let deletedClinicField = await this.doctorClinicModel.getByID(id);
    this.doctorClinicModel.deleteByID(id);
    return deletedClinicField;
  }

  async doctorClinicDayAvailableHours(
    doctorClinicId: number,
    day: string,
  ): Promise<FreeSlots[]> {
    let dayDate = new Date(day);
    let dateString = this.globalSerice.getDate(dayDate);
    let dayName = this.globalSerice.getDayName(dayDate.getDay());
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
      return new Date(i.fromDateTime).toLocaleTimeString('en-US', { hour12: true });
    });

    let startTimeDate = new Date(
      `${dateString} ${theDoctorClinic.availableDayHours.from}`,
    );
    let endTimeDate = new Date(`${dateString} ${theDoctorClinic.availableDayHours.to}`);

    let availableHours = this.getFreeSlots(
      mappedDoctorClinicBookedHours,
      startTimeDate,
      endTimeDate,
    );
    return availableHours;
  }

  async reserveSlot(doctorClinicId: number, userId: number, reqBody): Promise<string> {
    let dayDate = new Date(reqBody.dayDate);
    let dayTimesArray = reqBody.dayTimes;

    let localDayTimes = dayTimesArray.map((i) =>
      new Date(`2000-01-01T${this.globalSerice.timeTo24(i)}`).toLocaleTimeString(
        'en-US',
        { hour12: false },
      ),
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
      this.globalSerice.getDayName(dayDate.getDay()),
    );

    let doctorClinicBookedHours = theDoctorClinic.doctorClinicBookedHours
      ? theDoctorClinic.doctorClinicBookedHours
      : [];

    let mappedDoctorClinicBookedHours = doctorClinicBookedHours.map((i) => {
      return new Date(i.fromDateTime).toLocaleTimeString('en-US', { hour12: false });
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

  private getFreeSlots(mappedDoctorClinicBookedHours, startTimeDate, endTimeDate) {
    let availableHours = [];

    startTimeDate = new Date(startTimeDate);
    endTimeDate = new Date(endTimeDate);

    while (startTimeDate < endTimeDate) {
      let endOfSlot = new Date(startTimeDate);
      endOfSlot.setHours(startTimeDate.getHours() + 1);

      let timeSlotAvailable = this.getSlotState(
        mappedDoctorClinicBookedHours,
        startTimeDate.toLocaleTimeString('en-US', { hour12: true }),
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

      // availableHours.push(this.globalSerice.getLocalTime(startTimeDate));
      availableHours.push(startTimeDate.toLocaleTimeString('en-US', { hour12: false }));

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
