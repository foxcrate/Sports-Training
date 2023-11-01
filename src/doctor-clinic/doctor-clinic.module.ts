import { Module } from '@nestjs/common';
import { DoctorClinicController } from './doctor-clinic.controller';
import { DoctorClinicService } from './doctor-clinic.service';
import { AdminDoctorClinicController } from './admin-doctor-clinic.controller';
import { AdminDoctorClinicService } from './admin-doctor-clinic.service';
import { DoctorClinicModel } from './doctor-clinic.model';

@Module({
  controllers: [AdminDoctorClinicController, DoctorClinicController],
  providers: [AdminDoctorClinicService, DoctorClinicService, DoctorClinicModel],
  exports: [DoctorClinicModel],
})
export class DoctorClinicModule {}
