import { ApiProperty } from '@nestjs/swagger';
import { GlobalReturnDTO } from 'src/global/dtos/global-return.dto';
import { UpcomingSessionDto } from './upcoming-session.dto';
import { PackageDto } from './package.dto';
import { SportWithImageDto } from './sport-with-image.dto';

export class PlayerHomeDto {
  @ApiProperty({
    type: SportWithImageDto,
    isArray: true,
  })
  sports: SportWithImageDto[];

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
