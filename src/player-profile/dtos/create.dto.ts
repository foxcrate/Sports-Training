import { ApiProperty } from '@nestjs/swagger';

export class PlayerProfileCreateDto {
  @ApiProperty()
  levelId: Number;
  @ApiProperty()
  regionId: Number;
  @ApiProperty({ type: Number, isArray: true })
  sports: Number[];
}
