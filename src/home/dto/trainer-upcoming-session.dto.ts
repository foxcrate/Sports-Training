import { ApiProperty } from '@nestjs/swagger';
import { GlobalReturnDTO } from 'src/global/dtos/global-return.dto';

export class TrainerUpcomingSessionDto {
  @ApiProperty()
  id: Number;

  @ApiProperty()
  date: String;

  @ApiProperty()
  status: String;

  @ApiProperty({
    type: String,
    isArray: true,
  })
  sportName: String;

  @ApiProperty()
  playerFirstName: String;

  @ApiProperty()
  playerLastName: String;

  @ApiProperty()
  playerProfileImage: String;

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
