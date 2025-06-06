import { ApiProperty } from '@nestjs/swagger';

export class FeedbackDto {
  @ApiProperty()
  id: Number;

  @ApiProperty()
  feedback: String;

  @ApiProperty()
  rate: String;

  @ApiProperty()
  coachFirstName: String;

  @ApiProperty()
  coachLastName: String;

  @ApiProperty()
  coachProfileImage: String;

  @ApiProperty()
  date: String;
}
