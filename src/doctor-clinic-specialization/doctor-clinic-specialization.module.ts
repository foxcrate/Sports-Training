import { Module } from '@nestjs/common';
import { DoctorClinicSpecializationController } from './doctor-clinic-specialization.controller';
import { DoctorClinicSpecializationService } from './doctor-clinic-specialization.service';
import { DoctorClinicSpecializationModel } from './doctor-clinic-specialization.model';

@Module({
  controllers: [DoctorClinicSpecializationController],
  providers: [DoctorClinicSpecializationService, DoctorClinicSpecializationModel],
})
export class DoctorClinicSpecializationModule {}
