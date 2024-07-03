import { ApiProperty } from '@nestjs/swagger';

export class CoachDeclineSessionDto {
  @ApiProperty()
  declineReasonId: number;
}
