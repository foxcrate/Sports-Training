import { ApiProperty } from '@nestjs/swagger';

export class FeedbackReturnDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  content: string;
}
