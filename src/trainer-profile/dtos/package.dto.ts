import { ApiProperty } from '@nestjs/swagger';

export class Package {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  numberOfSessions: number;

  @ApiProperty()
  maxAttendees: number;

  @ApiProperty()
  minAttendees: number;

  @ApiProperty()
  location: string;
}
