enum Level {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced',
}

export class ReturnTrainerProfileDto {
  id: number;
  level: Level;
  ageGroupId: number;
  sessionDescription: String;
  cost: number;
  hoursPriorToBooking: number;
  userId: number;
  createdAt: number;
}
