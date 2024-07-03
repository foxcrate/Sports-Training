import { ApiProperty } from '@nestjs/swagger';
import { Certificate } from './certificate.dto';
import { GlobalReturnDTO } from 'src/global/dtos/global-return.dto';

export class ReturnTrainerProfileDetailsDto {
  @ApiProperty()
  id: number;

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

  @ApiProperty({
    type: GlobalReturnDTO,
  })
  region: GlobalReturnDTO;

  @ApiProperty()
  sports: number[];

  @ApiProperty()
  fields: number[];

  @ApiProperty()
  userId: number;

  @ApiProperty()
  certificates: Certificate[];

  @ApiProperty()
  createdAt: number;
}
