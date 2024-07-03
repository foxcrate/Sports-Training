import { ApiProperty } from '@nestjs/swagger';

export class CreateDoctorClinicSpecializationDto {
  @ApiProperty()
  name_en: String;

  @ApiProperty()
  name_ar: String;
}
