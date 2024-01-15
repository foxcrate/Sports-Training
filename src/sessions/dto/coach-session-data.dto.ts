import { ACCEPTANCE_STATUSES_ENUM, SESSIONS_STATUSES_ENUM } from 'src/global/enums';

export interface CoachSessionDataDto {
  coachBookedSessionId: number;
  coachUserId: number;
  sessionRequestId: number;
  bookedSessionStatus: SESSIONS_STATUSES_ENUM;
  sessionRequestType: string;
  sessionRequestStatus: ACCEPTANCE_STATUSES_ENUM;
}
