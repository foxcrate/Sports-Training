import { ApiProperty } from '@nestjs/swagger';
import { GlobalReturnDTO } from 'src/global/dtos/global-return.dto';

export class FieldCardFormatDto {
  @ApiProperty()
  fieldName: string;

  @ApiProperty()
  fieldProfileImage: string;

  @ApiProperty()
  cost: string;

  @ApiProperty()
  date: string;

  @ApiProperty({
    type: GlobalReturnDTO,
  })
  sport: GlobalReturnDTO;

  @ApiProperty({
    type: GlobalReturnDTO,
  })
  region: GlobalReturnDTO;

  @ApiProperty()
  startTime: string;

  @ApiProperty()
  endTime: string;
}
