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

  @ApiProperty({
    type: Number,
    isArray: true,
  })
  sports: number[];

  @ApiProperty({
    type: Number,
    isArray: true,
  })
  fields: number[];

  @ApiProperty({
    type: String,
    isArray: true,
  })
  images: String[];

  @ApiProperty({
    type: Certificate,
    isArray: true,
  })
  certificates: Certificate[];
}
