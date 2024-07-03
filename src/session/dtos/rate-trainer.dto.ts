import { ApiProperty } from '@nestjs/swagger';

export class RateTrainerDto {
  @ApiProperty()
  sessionId: number;

  @ApiProperty()
  ratingNumber: number;

  @ApiProperty()
  feedback: string;
}
