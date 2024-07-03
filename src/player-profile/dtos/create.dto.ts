import { ApiProperty } from '@nestjs/swagger';

export class PlayerProfileCreateDto {
  @ApiProperty()
  levelId: Number;
  @ApiProperty()
  regionId: Number;
  @ApiProperty()
  sports: Number[];
}
