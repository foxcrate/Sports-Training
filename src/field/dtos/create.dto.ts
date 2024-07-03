import { ApiProperty } from '@nestjs/swagger';

export class FieldCreateDto {
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
  sportId: number;

  @ApiProperty()
  regionId: number;

  @ApiProperty({
    type: String,
    isArray: true,
  })
  availableWeekDays: string[];

  @ApiProperty()
  startTime: string;

  @ApiProperty()
  endTime: string;
}
