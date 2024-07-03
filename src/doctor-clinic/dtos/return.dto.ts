import { ApiProperty } from '@nestjs/swagger';

export class DoctorClinicReturnDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  cost: number;

  @ApiProperty()
  slotDuration: number;

  @ApiProperty()
  address: string;

  @ApiProperty()
  longitude: number;

  @ApiProperty()
  latitude: number;

  @ApiProperty()
  profileImage: string;

  @ApiProperty()
  regionId: number;

  @ApiProperty()
  doctorClinicSpecializationId: number;

  @ApiProperty()
  availableWeekDays: string[];

  @ApiProperty()
  startTime: string;

  @ApiProperty()
  endTime: string;

  @ApiProperty()
  createdAt: Date;
}
