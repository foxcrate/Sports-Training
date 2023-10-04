enum Level {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced',
}

export class ReturnPlayerProfileDto {
  id: number;
  level: Level;
  userId: number;
  regionId: number;
  sports: [];
}
