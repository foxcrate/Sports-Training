import { ApiProperty } from '@nestjs/swagger';
import { CreateSlotDetailsDto } from './create-slots-details.dto';
import { number } from 'joi';

export class ScheduleWithSlotsCreateDto {
  @ApiProperty({
    type: number,
    isArray: true,
  })
  months: number[];

  @ApiProperty({
    type: CreateSlotDetailsDto,
    isArray: true,
  })
  slots: CreateSlotDetailsDto[];
}
