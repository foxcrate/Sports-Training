import { ApiProperty } from '@nestjs/swagger';

export class GlobalReturnDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;
}
