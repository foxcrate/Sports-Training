import { ApiProperty } from '@nestjs/swagger';

export class CancellingReasonDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;
}
