import { ReturnSportDto } from 'src/sport/dtos/return.dto';

export class SessionCardDTO {
  firstName: string;
  lastName: string;
  profileImage: string;
  date: string;
  trainerProfileId: number;
  fromTime: string;
  toTime: string;
  cost: number;
  sports: ReturnSportDto[];
}
