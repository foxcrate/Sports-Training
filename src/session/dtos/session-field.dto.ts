import { ApiProperty } from '@nestjs/swagger';

export class SessionFieldDTO {
  @ApiProperty()
  fieldId: number;

  @ApiProperty()
  fieldRegionId: string;

  @ApiProperty()
  fieldRegionName: string;
}
