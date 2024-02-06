import { SESSIONS_STATUSES_ENUM, SESSION_REQUEST_STATUSES_ENUM } from 'src/global/enums';

export interface CoachSessionDataDto {
  coachBookedSessionId: number;
  coachUserId: number;
  sessionRequestId: number;
  bookedSessionStatus: SESSIONS_STATUSES_ENUM;
  sessionRequestType: string;
  sessionRequestStatus: SESSION_REQUEST_STATUSES_ENUM;
  slotId: number;
  date: string;
}
