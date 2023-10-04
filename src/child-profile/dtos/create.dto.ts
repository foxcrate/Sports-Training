enum Level {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced',
}

export class ChildProfileCreateDto {
  level: Level;
  regionId: Number;
  childId: Number;
  sports: Number[];
}
