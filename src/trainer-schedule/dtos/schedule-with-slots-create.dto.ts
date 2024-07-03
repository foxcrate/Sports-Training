import { CreateSlotDetailsDto } from './create-slots-details.dto';

export class ScheduleWithSlotsCreateDto {
  months: number[];
  slots: CreateSlotDetailsDto[];
}
