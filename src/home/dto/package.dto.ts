import { ApiProperty } from '@nestjs/swagger';

export class PackageDto {
  @ApiProperty()
  id: Number;

  @ApiProperty()
  name: String;

  @ApiProperty()
  description: String;

  @ApiProperty()
  type: String;

  @ApiProperty()
  price: Number;

  @ApiProperty()
  numberOfSessions: Number;

  @ApiProperty()
  ExpirationDate: String;

  @ApiProperty()
  maxAttendees: Number;

  @ApiProperty()
  minAttendees: Number;

  @ApiProperty()
  location: String;

  @ApiProperty()
  trainerProfileId: Number;

  @ApiProperty()
  coachFirstName: String;

  @ApiProperty()
  coachLastName: String;

  @ApiProperty()
  coachProfileImage: String;
}
