import { ApiProperty } from '@nestjs/swagger';

export class PictureDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  imageLink: string;
}
