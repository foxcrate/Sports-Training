import { ApiProperty } from '@nestjs/swagger';
import { GlobalReturnDTO } from 'src/global/dtos/global-return.dto';
import { UpcomingSessionDto } from './upcoming-session.dto';
import { PackageDto } from './package.dto';
import { ReturnSportDto } from 'src/sport/dtos/return.dto';

export class PlayerHomeDto {
  @ApiProperty({
    type: ReturnSportDto,
    isArray: true,
  })
  sports: ReturnSportDto[];

  @ApiProperty({
    type: UpcomingSessionDto,
    isArray: true,
  })
  upcomingSession: UpcomingSessionDto[];

  @ApiProperty({
    type: UpcomingSessionDto,
    isArray: true,
  })
  ongoingSessions: UpcomingSessionDto[];

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
