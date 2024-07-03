import { ApiProperty } from '@nestjs/swagger';

export class FreeSlots {
  @ApiProperty()
  from: string;

  @ApiProperty()
  to: string;

  @ApiProperty()
  state: boolean;
}
