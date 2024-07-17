import { ApiProperty } from '@nestjs/swagger';
import { GlobalReturnDTO } from 'src/global/dtos/global-return.dto';

export class UpcomingSessionDto {
  @ApiProperty()
  id: Number;

  @ApiProperty()
  date: String;

  @ApiProperty()
  status: String;

  @ApiProperty()
  coachFirstName: String;

  @ApiProperty()
  coachLastName: String;

  @ApiProperty()
  coachProfileImage: String;

  @ApiProperty()
  fieldId: Number;

  @ApiProperty()
  fieldName: String;

  @ApiProperty()
  location: String;

  @ApiProperty()
  startTime: String;

  @ApiProperty()
  endTime: String;
}
