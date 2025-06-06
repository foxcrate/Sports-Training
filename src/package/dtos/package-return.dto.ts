import { ApiProperty } from '@nestjs/swagger';
import { SessionDateTimeDto } from './session-date-time.dto';
import { PACKAGE_STATUS, PACKAGE_TYPE } from 'src/global/enums';

export class PackageReturnDto {
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

  @ApiProperty({
    enum: PACKAGE_STATUS,
  })
  status: PACKAGE_STATUS;

  @ApiProperty()
  numberOfSessions: number;

  @ApiProperty()
  currentAttendeesNumber: number;

  @ApiProperty()
  minAttendees: number;

  @ApiProperty()
  maxAttendees: number;

  @ApiProperty()
  price: number;

  @ApiProperty()
  ExpirationDate: string;

  @ApiProperty()
  fieldId: number;

  @ApiProperty()
  secondaryFieldId: number;

  @ApiProperty()
  trainerProfileId: number;

  @ApiProperty({
    isArray: true,
    type: SessionDateTimeDto,
  })
  sessionsDateTime: SessionDateTimeDto[];
}
