enum Level {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced',
}

export class ReturnChildProfileWithChildAndSportsDto {
  id: number;
  level: Level;
  regionId: number;
  childId: number;
  firstName: string;
  lastName: string;
  sports: [];
}
