import { Certificate } from './certificate.dto';

enum Level {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced',
}

export class ReturnTrainerProfileDetailsDto {
  id: number;
  level: Level;
  ageGroupId: number;
  cost: number;
  sessionDescription: String;
  region: {};
  sports: number[];
  fields: number[];
  userId: number;
  certificates: Certificate[];
  createdAt: number;
}
