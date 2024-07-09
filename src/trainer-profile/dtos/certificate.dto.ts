import { ApiProperty } from '@nestjs/swagger';

export class Certificate {
  @ApiProperty()
  name: string;

  @ApiProperty()
  imageLink: string;
}
