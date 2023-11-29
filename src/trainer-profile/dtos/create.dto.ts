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

export class TrainerProfileCreateDto {
  level: Level;
  ageGroup: AgeGroup;
  sessionDescription: String;
  regionId: Number;
  sports: Number[];
  fields: Number[];
}
