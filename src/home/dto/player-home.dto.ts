import { ApiProperty } from '@nestjs/swagger';
import { GlobalReturnDTO } from 'src/global/dtos/global-return.dto';
import { UpcomingSessionDto } from './upcoming-session.dto';
import { PackageDto } from './package.dto';

export class PlayerHomeDto {
  @ApiProperty({
    type: GlobalReturnDTO,
    isArray: true,
  })
  sports: GlobalReturnDTO[];

  @ApiProperty({
    type: UpcomingSessionDto,
    isArray: true,
  })
  upcomingSession: UpcomingSessionDto[];

  @ApiProperty({
    type: String,
    isArray: true,
  })
  childrenNames: string[];

  @ApiProperty({
    type: PackageDto,
    isArray: true,
  })
  childPackages: PackageDto[];
}
