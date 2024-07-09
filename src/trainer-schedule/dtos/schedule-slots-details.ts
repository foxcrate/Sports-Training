import { ApiProperty } from '@nestjs/swagger';
import { SlotDetailsDto } from './slot-details.dto';

export class ScheduleSlotsDetailsDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  trainerProfileId: number;

  @ApiProperty()
  scheduleMonths: number[];

  @ApiProperty()
  trainerDefaultSlotCost: number;

  @ApiProperty({
    type: SlotDetailsDto,
    isArray: true,
  })
  ScheduleSlots: SlotDetailsDto[];
}
