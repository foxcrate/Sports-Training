enum Level {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced',
}

export class NativeChildProfileDto {
  id: number;
  level: Level;
  childId: number;
  regionId: number;
  sports: [];
}
