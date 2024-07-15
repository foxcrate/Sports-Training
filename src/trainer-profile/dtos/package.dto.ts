import { ApiProperty } from '@nestjs/swagger';
import { PACKAGE_STATUS, PACKAGE_TYPE } from 'src/global/enums';

export class Package {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty({
    enum: PACKAGE_TYPE,
  })
  type: PACKAGE_TYPE;

  @ApiProperty()
  price: number;

  @ApiProperty({
    enum: PACKAGE_STATUS,
  })
  status: PACKAGE_STATUS;

  @ApiProperty()
  numberOfSessions: number;

  @ApiProperty()
  currentAttendeesNumber: number;

  @ApiProperty()
  maxAttendees: number;

  @ApiProperty()
  minAttendees: number;

  @ApiProperty()
  location: string;
}
