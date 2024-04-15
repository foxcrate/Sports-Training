import { Module } from '@nestjs/common';
import { DoctorClinicController } from './doctor-clinic.controller';
import { DoctorClinicService } from './doctor-clinic.service';
import { AdminDoctorClinicController } from './admin-doctor-clinic.controller';
import { AdminDoctorClinicService } from './admin-doctor-clinic.service';
import { DoctorClinicRepository } from './doctor-clinic.repository';

@Module({
  controllers: [AdminDoctorClinicController, DoctorClinicController],
  providers: [AdminDoctorClinicService, DoctorClinicService, DoctorClinicRepository],
  exports: [DoctorClinicRepository],
})
export class DoctorClinicModule {}
