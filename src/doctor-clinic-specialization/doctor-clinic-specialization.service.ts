import { Injectable } from '@nestjs/common';
import { CreateDoctorClinicSpecializationDto } from './dtos/create.dto';
import { ReturnDoctorClinicSpecializationDto } from './dtos/retrun.dto';
import { DoctorClinicSpecializationRepository } from './doctor-clinic-specialization.repository';

@Injectable()
export class DoctorClinicSpecializationService {
  constructor(
    private doctorClinicSpecializationRepository: DoctorClinicSpecializationRepository,
  ) {}
  async create(
    createData: CreateDoctorClinicSpecializationDto,
  ): Promise<ReturnDoctorClinicSpecializationDto> {
    await this.doctorClinicSpecializationRepository.findRepeated(createData.name_en);
    return await this.doctorClinicSpecializationRepository.create(createData);
  }

  async getAll() {
    let allDoctorClinicSpecialization =
      await this.doctorClinicSpecializationRepository.getAll();
    return allDoctorClinicSpecialization;
  }
}
