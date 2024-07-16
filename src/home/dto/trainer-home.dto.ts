import { ApiProperty } from '@nestjs/swagger';
import { GlobalReturnDTO } from 'src/global/dtos/global-return.dto';
import { UpcomingSessionDto } from './upcoming-session.dto';
import { PackageDto } from './package.dto';
import { SportFieldDto } from './sport-field.dto';
import { LastSessionTraineeDto } from './last-session-trainee.dto';

export class TrainerHomeDto {
  @ApiProperty({
    type: SportFieldDto,
    isArray: true,
  })
  sportsFields: SportFieldDto[];

  @ApiProperty({
    type: UpcomingSessionDto,
    isArray: true,
  })
  upcomingSession: UpcomingSessionDto[];

  @ApiProperty({
    type: UpcomingSessionDto,
    isArray: true,
  })
  pendingSession: UpcomingSessionDto[];

  @ApiProperty({
    type: LastSessionTraineeDto,
    isArray: true,
  })
  lastSessionsTrainees: LastSessionTraineeDto[];
}
