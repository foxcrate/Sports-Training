enum Level {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced',
}

enum AgeGroup {
  Kids = 'kids',
  YoungAdults = 'young_adults',
  Adults = 'adults',
}

export class ReturnTrainerProfileDetailsDto {
  id: number;
  level: Level;
  ageGroup: AgeGroup;
  cost: number;
  sessionDescription: String;
  region: {};
  sports: number[];
  fields: number[];
  userId: number;
  createdAt: number;
}
