import { Module } from '@nestjs/common';
import { DoctorClinicSpecializationController } from './doctor-clinic-specialization.controller';
import { DoctorClinicSpecializationService } from './doctor-clinic-specialization.service';
import { DoctorClinicSpecializationRepository } from './doctor-clinic-specialization.repository';

@Module({
  controllers: [DoctorClinicSpecializationController],
  providers: [DoctorClinicSpecializationService, DoctorClinicSpecializationRepository],
})
export class DoctorClinicSpecializationModule {}
