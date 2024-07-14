export const ALLOWED_PAGE_SIZES = [5, 10, 20, 50];

export const RATES_ENUM = {
  '0': { eq: 0 },
  '1': { eq: 1 },
  '2': { eq: 2 },
  '3': { eq: 3 },
  '4': { eq: 4 },
  '5': { eq: 5 },
};

export enum HOME_SEARCH_TYPES_ENUM {
  COACHES = 'coaches',
  DOCTORS = 'doctors',
  FIELDS = 'fields',
  ALL = 'all',
}

export enum PACKAGE_TYPE {
  FLEXIBLE = 'flexible',
  SCHEDULE = 'schedule',
}

export enum RATEABLE_TYPES_ENUM {
  TRAINER = 'trainerProfile',
  FIELD = 'field',
  DOCTOR_CLINIC = 'doctorClinic',
}

export enum ACCEPTANCE_STATUSES_ENUM {
  ACCEPTED = 'accepted',
  PENDING = 'pending',
  DECLINED = 'declined',
}

export enum SESSION_REQUEST_TYPE {
  NEW = 'new',
  CHANGE = 'change',
}

export enum USER_TYPES_ENUM {
  PLAYER = 'player',
  TRAINER = 'trainer',
  CHILD = 'child',
}

export enum PROFILE_TYPES_ENUM {
  PLAYER = 'player',
  TRAINER = 'trainer',
  CHILD = 'child',
}

export enum NOTIFICATION_SENT_TO {
  PLAYER_PROFILE = 'playerProfile',
  TRAINER_PROFILE = 'trainerProfile',
}

export enum NOTIFICATION_CONTENT {
  USER_REQUESTED_SESSION = 1,
  COACH_ACCEPTED_SESSION = 2,
  COACH_REJECTED_SESSION = 3,
  COACH_ACCEPTED_CHANGE_SESSION_TIME = 4,
  COACH_DECLINE_CHANGE_SESSION_TIME = 5,
}

export enum NOTIFICATION_ABOUT {
  TRAINER_SESSION = 'trainerSession',
}

export enum NOTIFICATION_TYPE {
  REQUEST = 'request',
  ACCEPT = 'accept',
  REJECT = 'reject',
}

export enum SESSIONS_STATUSES_ENUM {
  ACTIVE = 'active',
  NOT_ACTIVE = 'notActive',
  CANCELED = 'canceled',
}

export enum SESSION_REQUEST_STATUSES_ENUM {
  ACCEPTED = 'accepted',
  PENDING = 'pending',
  REJECTED = 'rejected',
}

export enum CANCELED_BY_ENUM {
  PLAYER = 'player',
  TRAINER = 'trainer',
}
