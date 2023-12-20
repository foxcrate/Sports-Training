export const ALLOWED_PAGE_SIZES = [10, 20, 50];

export const RATES_ENUM = {
  '1': { lte: 1 },
  '2': { gt: 1, lte: 2 },
  '3': { gt: 2, lte: 3 },
  '4': { gt: 3, lte: 4 },
  '5': { gt: 4 },
};

export const HOME_SEARCH_TYPES_ENUM = {
  COACHES: 'coaches',
  DOCTORS: 'doctors',
  FIELDS: 'fields',
};
