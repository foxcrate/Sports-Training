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

export class ReturnTrainerProfileDto {
  id: number;
  level: Level;
  ageGroup: AgeGroup;
  cost: number;
  sessionDescription: String;
  userId: number;
  createdAt: number;
}
