enum Level {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced',
}

export class ReturnTrainerProfileDto {
  id: number;
  level: Level;
  ageGroupId: number;
  cost: number;
  sessionDescription: String;
  userId: number;
  createdAt: number;
}
