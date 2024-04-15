import { BadRequestException, Injectable } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { DoctorClinicRepository } from './doctor-clinic.repository';
import { DoctorClinicBookingDetailsDTO } from './dtos/doctorClinicBookingDetails.dto';
import { DoctorClinicCreateDto } from './dtos/create.dto';
import { DoctorClinicReturnDto } from './dtos/return.dto';
import { DoctorClinicUpdateDto } from './dtos/update.dto';
import { DoctorClinicAcceptanceStatusDto } from './dtos/doctor-clinic-acceptance-status.dto';

@Injectable()
export class AdminDoctorClinicService {
  constructor(
    private doctorClinicRepository: DoctorClinicRepository,
    private readonly i18n: I18nService,
  ) {}

  async getAll(): Promise<DoctorClinicBookingDetailsDTO[]> {
    return await this.doctorClinicRepository.allDoctorClinics();
  }

  async getOne(id: number): Promise<DoctorClinicBookingDetailsDTO> {
    return await this.doctorClinicRepository.getByID(id);
  }

  async create(reqBody: DoctorClinicCreateDto): Promise<DoctorClinicReturnDto> {
    // check for repeated name;
    let repeatedField = await this.doctorClinicRepository.getByName(reqBody.name);

    if (repeatedField) {
      throw new BadRequestException(
        this.i18n.t(`errors.REPEATED_DOCTOR_CLINIC`, {
          lang: I18nContext.current().lang,
        }),
      );
    }

    reqBody.availableWeekDays = JSON.stringify(reqBody.availableWeekDays);

    return await this.doctorClinicRepository.create(reqBody);
  }

  async update(
    id: number,
    reqBody: DoctorClinicUpdateDto,
  ): Promise<DoctorClinicReturnDto> {
    // check for repeated name;
    let repeatedDoctorClinic = await this.doctorClinicRepository.getByName(reqBody.name);

    if (repeatedDoctorClinic && repeatedDoctorClinic.id != id) {
      throw new BadRequestException(
        this.i18n.t(`errors.REPEATED_DOCTOR_CLINIC`, {
          lang: I18nContext.current().lang,
        }),
      );
    }
    reqBody.availableWeekDays = JSON.stringify(reqBody.availableWeekDays);

    return await this.doctorClinicRepository.update(id, reqBody);
  }

  async delete(id: number): Promise<DoctorClinicBookingDetailsDTO> {
    console.log('alo');

    let deletedDoctorClinic = await this.doctorClinicRepository.getByID(id);
    Promise.all([
      await this.doctorClinicRepository.deleteNotAvailableDays(id),
      await this.doctorClinicRepository.deleteRates(id),
      await this.doctorClinicRepository.deleteBookedHours(id),
    ]);
    await this.doctorClinicRepository.deleteByID(id);
    return deletedDoctorClinic;
  }

  async getPendingDoctorClinics(): Promise<DoctorClinicBookingDetailsDTO[]> {
    let pendingDoctorFields =
      await this.doctorClinicRepository.selectPendingDoctorClinics();
    return pendingDoctorFields;
  }

  async changeDoctorClinicAcceptanceStatue(
    doctorClinicId: number,
    newStatus: DoctorClinicAcceptanceStatusDto,
  ): Promise<boolean> {
    let theDoctorClinic = await this.doctorClinicRepository.getByID(doctorClinicId);
    if (theDoctorClinic.acceptanceStatus != DoctorClinicAcceptanceStatusDto.Pending) {
      throw new BadRequestException(
        this.i18n.t(`errors.DOCTOR_CLINIC_NOT_PENDING`, {
          lang: I18nContext.current().lang,
        }),
      );
    }
    return await this.doctorClinicRepository.setDoctorClinicAcceptanceStatue(
      doctorClinicId,
      newStatus,
    );
  }

  async addNotAvailableDays(doctorClinicId: number, datesArray: string[]) {
    let theDoctorClinic = await this.doctorClinicRepository.getByID(doctorClinicId);
    return await this.doctorClinicRepository.insertNotAvailableDays(
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
