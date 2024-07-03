import { ApiProperty } from '@nestjs/swagger';

export class RequestSlotChangeDto {
  @ApiProperty()
  newSlotId: number;

  @ApiProperty()
  newDate: string;
}
