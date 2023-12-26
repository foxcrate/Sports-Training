import { BadRequestException, Injectable } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { DoctorClinicModel } from './doctor-clinic.model';
import { DoctorClinicBookingDetailsDTO } from './dtos/doctorClinicBookingDetails.dto';
import { DoctorClinicCreateDto } from './dtos/create.dto';
import { DoctorClinicReturnDto } from './dtos/return.dto';
import { DoctorClinicUpdateDto } from './dtos/update.dto';
import { DoctorClinicAcceptanceStatusDto } from './dtos/doctor-clinic-acceptance-status.dto';

@Injectable()
export class AdminDoctorClinicService {
  constructor(
    private doctorClinicModel: DoctorClinicModel,
    private readonly i18n: I18nService,
  ) {}

  async getAll(): Promise<DoctorClinicBookingDetailsDTO[]> {
    return await this.doctorClinicModel.allDoctorClinics();
  }

  async getOne(id: number): Promise<DoctorClinicBookingDetailsDTO> {
    return await this.doctorClinicModel.getByID(id);
  }

  async create(reqBody: DoctorClinicCreateDto): Promise<DoctorClinicReturnDto> {
    // check for repeated name;
    let repeatedField = await this.doctorClinicModel.getByName(reqBody.name);

    if (repeatedField) {
      throw new BadRequestException(
        this.i18n.t(`errors.REPEATED_DOCTOR_CLINIC`, {
          lang: I18nContext.current().lang,
        }),
      );
    }

    reqBody.availableWeekDays = JSON.stringify(reqBody.availableWeekDays);

    return await this.doctorClinicModel.create(reqBody);
  }

  async update(
    id: number,
    reqBody: DoctorClinicUpdateDto,
  ): Promise<DoctorClinicReturnDto> {
    // check for repeated name;
    let repeatedDoctorClinic = await this.doctorClinicModel.getByName(reqBody.name);

    if (repeatedDoctorClinic && repeatedDoctorClinic.id != id) {
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
    console.log('alo');

    let deletedDoctorClinic = await this.doctorClinicModel.getByID(id);
    Promise.all([
      await this.doctorClinicModel.deleteNotAvailableDays(id),
      await this.doctorClinicModel.deleteRates(id),
      await this.doctorClinicModel.deleteBookedHours(id),
    ]);
    await this.doctorClinicModel.deleteByID(id);
    return deletedDoctorClinic;
  }

  async getPendingDoctorClinics(): Promise<DoctorClinicBookingDetailsDTO[]> {
    let pendingDoctorFields = await this.doctorClinicModel.selectPendingDoctorClinics();
    return pendingDoctorFields;
  }

  async changeDoctorClinicAcceptanceStatue(
    doctorClinicId: number,
    newStatus: DoctorClinicAcceptanceStatusDto,
  ): Promise<boolean> {
    let theDoctorClinic = await this.doctorClinicModel.getByID(doctorClinicId);
    if (theDoctorClinic.acceptanceStatus != DoctorClinicAcceptanceStatusDto.Pending) {
      throw new BadRequestException(
        this.i18n.t(`errors.DOCTOR_CLINIC_NOT_PENDING`, {
          lang: I18nContext.current().lang,
        }),
      );
    }
    return await this.doctorClinicModel.setDoctorClinicAcceptanceStatue(
      doctorClinicId,
      newStatus,
    );
  }

  async addNotAvailableDays(doctorClinicId: number, datesArray: string[]) {
    let theDoctorClinic = await this.doctorClinicModel.getByID(doctorClinicId);
    return await this.doctorClinicModel.insertNotAvailableDays(
      doctorClinicId,
      datesArray,
    );
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
