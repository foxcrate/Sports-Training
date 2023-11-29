enum Level {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced',
}

export class ReturnPlayerProfileDto {
  id: number;
  level: Level;
  regionId: number;
  userId: number;
  sports: [];
  createdAt: number;
}
