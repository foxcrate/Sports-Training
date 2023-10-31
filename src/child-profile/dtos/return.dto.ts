enum Level {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced',
}

export class ReturnChildProfileDto {
  id: number;
  level: Level;
  regionId: number;
  childId: number;
  sports: [];
  createdAt: Date;
}
