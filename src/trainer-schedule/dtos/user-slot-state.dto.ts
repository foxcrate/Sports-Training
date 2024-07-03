import { ApiProperty } from '@nestjs/swagger';

export class UserSlotState {
  @ApiProperty()
  slotId: number;

  @ApiProperty()
  fromTime: string;

  @ApiProperty()
  toTime: string;

  @ApiProperty()
  status: boolean;
}
