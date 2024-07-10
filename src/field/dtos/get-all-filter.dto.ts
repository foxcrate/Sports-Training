import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class GetAllFilterDto {
  @ApiProperty()
  @IsOptional()
  regionId: string;
}
