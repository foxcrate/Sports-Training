import { Certificate } from './certificate.dto';

enum Level {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced',
}

export class TrainerProfileCreateDto {
  level: Level;
  ageGroupId: number;
  sessionDescription: String;
  cost: number;
  hoursPriorToBooking: number;
  regionId: number;
  sports: number[];
  fields: number[];
  images: String[];
  certificates: Certificate[];
}
