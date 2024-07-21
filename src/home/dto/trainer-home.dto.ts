import { ApiProperty } from '@nestjs/swagger';
import { TrainerUpcomingSessionDto } from './trainer-upcoming-session.dto';
import { SportFieldDto } from './sport-field.dto';
import { LastSessionTraineeDto } from './last-session-trainee.dto';
import { UserInfoDto } from './user-info.dto';

export class TrainerHomeDto {
  @ApiProperty({
    type: UserInfoDto,
  })
  userInfo: UserInfoDto;

  @ApiProperty({
    type: SportFieldDto,
    isArray: true,
  })
  sportsFields: SportFieldDto[];

  @ApiProperty({
    type: TrainerUpcomingSessionDto,
    isArray: true,
  })
  upcomingSession: TrainerUpcomingSessionDto[];

  @ApiProperty({
    type: TrainerUpcomingSessionDto,
    isArray: true,
  })
  pendingSession: TrainerUpcomingSessionDto[];

  @ApiProperty({
    type: LastSessionTraineeDto,
    isArray: true,
  })
  lastSessionsTrainees: LastSessionTraineeDto[];
}
