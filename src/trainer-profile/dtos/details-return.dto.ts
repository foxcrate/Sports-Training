import { Certificate } from './certificate.dto';

export class ReturnTrainerProfileDetailsDto {
  id: number;
  levelId: number;
  ageGroupId: number;
  sessionDescription: String;
  cost: number;
  hoursPriorToBooking: number;
  region: {};
  sports: number[];
  fields: number[];
  userId: number;
  certificates: Certificate[];
  createdAt: number;
}
