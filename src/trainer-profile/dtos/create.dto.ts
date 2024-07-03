import { ApiProperty } from '@nestjs/swagger';
import { Certificate } from './certificate.dto';

export class TrainerProfileCreateDto {
  @ApiProperty()
  levelId: number;

  @ApiProperty()
  ageGroupId: number;

  @ApiProperty()
  sessionDescription: String;

  @ApiProperty()
  cost: number;

  @ApiProperty()
  hoursPriorToBooking: number;

  @ApiProperty()
  regionId: number;

  @ApiProperty()
  sports: number[];

  @ApiProperty()
  fields: number[];

  @ApiProperty()
  images: String[];

  @ApiProperty({
    type: Certificate,
    isArray: true,
  })
  certificates: Certificate[];
}
