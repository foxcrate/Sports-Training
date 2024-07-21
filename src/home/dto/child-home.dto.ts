import { ApiProperty } from '@nestjs/swagger';
import { PlayerUpcomingSessionDto } from './player-upcoming-session.dto';
import { FeedbackDto } from './feedback.dto';
import { UserInfoDto } from './user-info.dto';

export class ChildHomeDto {
  @ApiProperty({
    type: UserInfoDto,
  })
  userInfo: UserInfoDto;

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
