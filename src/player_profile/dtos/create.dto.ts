enum Level {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced',
}

export class PlayerProfileCreateDto {
  level: Level;
  regionId: Number;
  sports: Number[];
}
