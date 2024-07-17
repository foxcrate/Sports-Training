import { ApiProperty } from '@nestjs/swagger';
import { GlobalReturnDTO } from 'src/global/dtos/global-return.dto';
import { TrainerUpcomingSessionDto } from './trainer-upcoming-session.dto';
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
