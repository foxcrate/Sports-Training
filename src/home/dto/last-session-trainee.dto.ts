import { ApiProperty } from '@nestjs/swagger';

export class LastSessionTraineeDto {
  @ApiProperty()
  id: Number;

  @ApiProperty()
  firstName: String;

  @ApiProperty()
  lastName: String;

  @ApiProperty()
  profileImage: String;

  @ApiProperty()
  date: String;
}
