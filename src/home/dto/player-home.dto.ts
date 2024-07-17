import { ApiProperty } from '@nestjs/swagger';
import { GlobalReturnDTO } from 'src/global/dtos/global-return.dto';
import { PlayerUpcomingSessionDto } from './player-upcoming-session.dto';
import { PackageDto } from './package.dto';
import { ReturnSportDto } from 'src/sport/dtos/return.dto';

export class PlayerHomeDto {
  @ApiProperty({
    type: ReturnSportDto,
    isArray: true,
  })
  sports: ReturnSportDto[];

  @ApiProperty({
    type: PlayerUpcomingSessionDto,
    isArray: true,
  })
  upcomingSession: PlayerUpcomingSessionDto[];

  @ApiProperty({
    type: PlayerUpcomingSessionDto,
    isArray: true,
  })
  ongoingSessions: PlayerUpcomingSessionDto[];

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
