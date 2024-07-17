import { ApiProperty } from '@nestjs/swagger';
import { GlobalReturnDTO } from 'src/global/dtos/global-return.dto';
import { PlayerUpcomingSessionDto } from './player-upcoming-session.dto';
import { PackageDto } from './package.dto';
import { SportFieldDto } from './sport-field.dto';
import { LastSessionTraineeDto } from './last-session-trainee.dto';
import { FeedbackDto } from './feedback.dto';

export class ChildHomeDto {
  @ApiProperty({
    type: PlayerUpcomingSessionDto,
    isArray: true,
  })
  upcomingSessions: PlayerUpcomingSessionDto[];

  @ApiProperty({
    type: FeedbackDto,
    isArray: true,
  })
  feedbacks: FeedbackDto[];
}
