import { Certificate } from './certificate.dto';

export class TrainerProfileCreateDto {
  levelId: number;
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
