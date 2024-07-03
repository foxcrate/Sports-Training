import { ApiProperty } from '@nestjs/swagger';

export class ReturnDoctorClinicSpecializationDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name_en: String;

  @ApiProperty()
  name_ar: String;

  @ApiProperty()
  createdAt: Date;
}
