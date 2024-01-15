import { SlotDetailsDto } from './slot-details.dto';

export class ScheduleCreateDto {
  months: number[];
  slots: SlotDetailsDto[];
}
