import { ApiProperty } from '@nestjs/swagger';
import { GlobalReturnDTO } from 'src/global/dtos/global-return.dto';
import { UpcomingSessionDto } from './upcoming-session.dto';
import { PackageDto } from './package.dto';
import { SportFieldDto } from './sport-field.dto';
import { LastSessionTraineeDto } from './last-session-trainee.dto';
import { FeedbackDto } from './feedback.dto';

export class ChildHomeDto {
  @ApiProperty({
    type: UpcomingSessionDto,
    isArray: true,
  })
  upcomingSessions: UpcomingSessionDto[];

  @ApiProperty({
    type: FeedbackDto,
    isArray: true,
  })
  feedbacks: FeedbackDto[];
}
