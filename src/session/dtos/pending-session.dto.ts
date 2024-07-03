import { ApiProperty } from '@nestjs/swagger';
import { SESSION_REQUEST_STATUSES_ENUM, SESSION_REQUEST_TYPE } from 'src/global/enums';
import { IdFromToTimeDto } from './slot-from-to.dto';
import { GlobalReturnDTO } from 'src/global/dtos/global-return.dto';
import { SessionUserDTO } from './session-user.dto';
import { SessionFieldDTO } from './session-field.dto';

export class PendingSessionDTO {
  @ApiProperty()
  sessionRequestId: number;

  @ApiProperty({
    enum: SESSION_REQUEST_TYPE,
  })
  type: SESSION_REQUEST_TYPE;

  @ApiProperty()
  bookedSessionId: number;

  @ApiProperty({
    enum: SESSION_REQUEST_STATUSES_ENUM,
  })
  sessionRequestStatus: SESSION_REQUEST_STATUSES_ENUM;

  @ApiProperty()
  date: string;

  @ApiProperty()
  newSessionDate: string;

  @ApiProperty({
    type: IdFromToTimeDto,
  })
  newSlot: {
    id: number;
    fromTime: string;
    toTime: string;
  };

  @ApiProperty({
    type: IdFromToTimeDto,
  })
  slot: {
    id: number;
    fromTime: string;
    toTime: string;
  };

  @ApiProperty({
    type: SessionUserDTO,
  })
  user: {
    id: number;
    firstName: string;
    lasttName: string;
    profileImage: string;
  };

  @ApiProperty({
    type: SessionFieldDTO,
  })
  field: {
    fieldId: number;
    fieldRegionId: number;
    fieldRegionName: string;
  };

  @ApiProperty({
    type: GlobalReturnDTO,
    isArray: true,
  })
  sport: {
    id: number;
    name: string;
  }[];
}
