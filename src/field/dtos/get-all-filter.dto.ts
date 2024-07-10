import { ApiProperty } from '@nestjs/swagger';

export class GetAllFilterDto {
  @ApiProperty()
  regionId: string;
}
