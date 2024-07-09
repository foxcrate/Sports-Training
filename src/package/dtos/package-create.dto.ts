import { ApiProperty } from '@nestjs/swagger';
import { SessionDateTimeDto } from './session-date-time.dto';

export class PackageCreateDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  numberOfSessions: number;

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

  @ApiProperty({
    isArray: true,
    type: SessionDateTimeDto,
  })
  sessionsDateTime: SessionDateTimeDto[];
}
