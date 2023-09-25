enum Level {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced',
}

export class ReturnChildProfileDto {
  id: number;
  level: Level;
  childId: number;
  regionId: number;
  sports: [];
}
