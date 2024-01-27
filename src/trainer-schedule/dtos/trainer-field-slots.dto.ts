import { ScheduleSlotsDTO } from './schedule-slots';

export class TrainerFieldSlots {
  trainerProfileId: number;
  notAvailableDays: string[];
  scheduleSlots: ScheduleSlotsDTO[];
}
