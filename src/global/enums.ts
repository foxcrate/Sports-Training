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
  TRAINER = 'trainer',
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
