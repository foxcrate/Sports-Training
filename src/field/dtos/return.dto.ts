import { ApiProperty } from '@nestjs/swagger';

export class FieldReturnDto {
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
  sportId: number;

  @ApiProperty()
  regionId: number;

  @ApiProperty()
  availableWeekDays: string[];

  @ApiProperty()
  startTime: string;

  @ApiProperty()
  endTime: string;

  @ApiProperty()
  createdAt: Date;
}
