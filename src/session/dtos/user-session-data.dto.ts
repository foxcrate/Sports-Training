import { SESSIONS_STATUSES_ENUM, SESSION_REQUEST_STATUSES_ENUM } from 'src/global/enums';

export interface UserSessionDataDto {
  bookedSessionId: number;
  userId: number;
  sessionRequestId: number;
  bookedSessionStatus: SESSIONS_STATUSES_ENUM;
  sessionRequestType: string;
  sessionRequestStatus: SESSION_REQUEST_STATUSES_ENUM;
  cancellationHours: number;
  date: string;
  fromTime: string;
  toTime: string;
}
