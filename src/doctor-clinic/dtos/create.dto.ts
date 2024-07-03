import { ApiProperty } from '@nestjs/swagger';

export class DoctorClinicCreateDto {
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
  @ApiProperty({
    isArray: true,
    type: String,
  })
  availableWeekDays: string[];
  @ApiProperty()
  startTime: string;
  @ApiProperty()
  endTime: string;
}
