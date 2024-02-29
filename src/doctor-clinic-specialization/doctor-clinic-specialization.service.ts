import { Injectable } from '@nestjs/common';
import { CreateDoctorClinicSpecializationDto } from './dtos/create.dto';
import { ReturnDoctorClinicSpecializationDto } from './dtos/retrun.dto';
import { DoctorClinicSpecializationModel } from './doctor-clinic-specialization.model';

@Injectable()
export class DoctorClinicSpecializationService {
  constructor(private doctorClinicSpecializationModel: DoctorClinicSpecializationModel) {}
  async create(
    createData: CreateDoctorClinicSpecializationDto,
  ): Promise<ReturnDoctorClinicSpecializationDto> {
    await this.doctorClinicSpecializationModel.findRepeated(createData.name_en);
    return await this.doctorClinicSpecializationModel.create(createData);
  }

  async getAll() {
    let allDoctorClinicSpecialization =
      await this.doctorClinicSpecializationModel.getAll();
    return allDoctorClinicSpecialization;
  }
}
