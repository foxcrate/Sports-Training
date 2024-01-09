import { SlotDetailsDto } from './slot-details.dto';

export class ScheduleSlotsDetailsDTO {
  id: number;
  trainerProfileId: number;
  scheduleMonths: number[];
  ScheduleSlots: SlotDetailsDto[];
}
