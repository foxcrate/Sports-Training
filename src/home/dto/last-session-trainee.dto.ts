import { ApiProperty } from '@nestjs/swagger';

export class LastSessionTraineeDto {
  @ApiProperty()
  userId: Number;

  @ApiProperty()
  firstName: String;

  @ApiProperty()
  lastName: String;

  @ApiProperty()
  profileImage: String;

  @ApiProperty()
  date: String;

  @ApiProperty()
  sessionFromTime: String;

  @ApiProperty()
  sessionId: Number;
}
