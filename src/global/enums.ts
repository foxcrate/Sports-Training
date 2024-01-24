export const ALLOWED_PAGE_SIZES = [10, 20, 50];

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

export enum PROFILE_TYPES_ENUM {
  PLAYER = 'player',
  TRAINER = 'trainer',
  CHILD = 'child',
}

export enum SESSIONS_STATUSES_ENUM {
  UPCOMING = 'upcoming',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
}

export enum SESSION_REQUEST_STATUSES_ENUM {
  ACCEPTED = 'accepted',
  PENDING = 'pending',
  REJECTED = 'rejected',
  CANCELED = 'canceled',
}

export enum CANCELED_BY_ENUM {
  PLAYER = 'player',
  TRAINER = 'trainer',
}
