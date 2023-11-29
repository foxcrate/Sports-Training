enum Level {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced',
}

export class ReturnPlayerProfileWithUserAndSportsDto {
  id: number;
  level: Level;
  regionId: number;
  userId: number;
  firstName: string;
  lastName: string;
  sports: [];
}
