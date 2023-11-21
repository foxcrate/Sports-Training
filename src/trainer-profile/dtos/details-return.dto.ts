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
  sessionDescription: String;
  region: {};
  sports: Number[];
  fields: Number[];
  userId: number;
  createdAt: number;
}
