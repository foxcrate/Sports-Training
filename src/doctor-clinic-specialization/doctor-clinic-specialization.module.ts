import { Module } from '@nestjs/common';
import { DoctorClinicSpecializationController } from './doctor-clinic-specialization.controller';
import { DoctorClinicSpecializationService } from './doctor-clinic-specialization.service';

@Module({
  controllers: [DoctorClinicSpecializationController],
  providers: [DoctorClinicSpecializationService]
})
export class DoctorClinicSpecializationModule {}
