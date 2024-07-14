import { ApiProperty } from '@nestjs/swagger';
import { Certificate } from './certificate.dto';
import { GlobalReturnDTO } from 'src/global/dtos/global-return.dto';
import { Package } from './package.dto';
import { PACKAGE_TYPE } from 'src/global/enums';

export class ReturnTrainerProfileDetailsDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  levelId: number;

  @ApiProperty()
  ageGroupId: number;

  @ApiProperty()
  sessionDescription: String;

  @ApiProperty({
    enum: PACKAGE_TYPE,
  })
  type: PACKAGE_TYPE;

  @ApiProperty()
  cost: number;

  @ApiProperty()
  hoursPriorToBooking: number;

  @ApiProperty({
    type: GlobalReturnDTO,
  })
  region: GlobalReturnDTO;

  @ApiProperty({
    type: GlobalReturnDTO,
    isArray: true,
  })
  sports: GlobalReturnDTO[];

  @ApiProperty({
    type: GlobalReturnDTO,
    isArray: true,
  })
  fields: GlobalReturnDTO[];

  @ApiProperty()
  userId: number;

  @ApiProperty({
    type: Certificate,
    isArray: true,
  })
  certificates: Certificate[];

  @ApiProperty({
    type: Package,
    isArray: true,
  })
  packages: Package[];

  @ApiProperty()
  createdAt: number;
}
