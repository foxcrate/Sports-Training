import { ApiProperty } from '@nestjs/swagger';
import { ReturnSportDto } from 'src/sport/dtos/return.dto';

export class SessionCardDTO {
  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  profileImage: string;

  @ApiProperty()
  date: string;

  @ApiProperty()
  trainerProfileId: number;

  @ApiProperty()
  fromTime: string;

  @ApiProperty()
  toTime: string;

  @ApiProperty()
  cost: number;

  @ApiProperty({ type: ReturnSportDto, isArray: true })
  sports: ReturnSportDto[];
}
