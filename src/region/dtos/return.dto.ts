import { ApiProperty } from '@nestjs/swagger';

export class RegionReturnDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: String;

  @ApiProperty()
  createdAt: Date;
}
