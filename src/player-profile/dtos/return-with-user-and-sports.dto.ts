import { ApiProperty } from '@nestjs/swagger';
import { GlobalReturnDTO } from 'src/global/dtos/global-return.dto';

export class ReturnPlayerProfileWithUserAndSportsDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  levelId: Number;

  @ApiProperty()
  regionId: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({
    type: GlobalReturnDTO,
    isArray: true,
  })
  sports: GlobalReturnDTO[];
}
