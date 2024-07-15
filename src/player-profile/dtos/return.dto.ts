import { ApiProperty } from '@nestjs/swagger';
import { GlobalReturnDTO } from 'src/global/dtos/global-return.dto';
import { Package } from 'src/trainer-profile/dtos/package.dto';

export class ReturnPlayerProfileDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  levelId: Number;
  @ApiProperty()
  regionId: number;
  @ApiProperty()
  userId: number;
  @ApiProperty({
    type: GlobalReturnDTO,
    isArray: true,
  })
  sports: GlobalReturnDTO[];

  @ApiProperty({
    type: Package,
    isArray: true,
  })
  packages: Package[];

  @ApiProperty()
  createdAt: number;
}
