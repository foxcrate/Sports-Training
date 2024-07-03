import { ApiProperty } from '@nestjs/swagger';

export class CreatePasswordDto {
  @ApiProperty()
  password: string;
}
