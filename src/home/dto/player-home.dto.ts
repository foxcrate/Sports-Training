import { ApiProperty } from '@nestjs/swagger';
import { PlayerUpcomingSessionDto } from './player-upcoming-session.dto';
import { PackageDto } from './package.dto';
import { ReturnSportDto } from 'src/sport/dtos/return.dto';
import { UserInfoDto } from './user-info.dto';

export class PlayerHomeDto {
  @ApiProperty({
    type: UserInfoDto,
  })
  userInfo: UserInfoDto;

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
