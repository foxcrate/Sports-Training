import { ApiProperty } from '@nestjs/swagger';

export class CardFormatDto {
  @ApiProperty()
  doctorClinicName: string;

  @ApiProperty()
  doctorClinicProfileImage: string;

  @ApiProperty()
  specializationName: string;

  @ApiProperty()
  cost: string;

  @ApiProperty()
  date: string;

  @ApiProperty()
  startTime: string;

  @ApiProperty()
  endTime: string;
}
