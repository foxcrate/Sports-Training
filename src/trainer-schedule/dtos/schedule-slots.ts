import { SlotDetailsDto } from './slot-details.dto';

export class ScheduleSlotsDTO {
  scheduleId: number;
  months: any[];
  slots: SlotDetailsDto[];
}
