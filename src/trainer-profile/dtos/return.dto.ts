import { ApiProperty } from '@nestjs/swagger';

export class ReturnTrainerProfileDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  levelId: number;

  @ApiProperty()
  ageGroupId: number;

  @ApiProperty()
  sessionDescription: String;

  @ApiProperty()
  cost: number;

  @ApiProperty()
  hoursPriorToBooking: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  createdAt: number;
}
