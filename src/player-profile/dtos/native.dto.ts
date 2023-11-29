enum Level {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced',
}

export class NativePlayerProfileDto {
  id: number;
  level: Level;
  userId: number;
  regionId: number;
  sports: [];
}
