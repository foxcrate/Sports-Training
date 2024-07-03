import { ApiProperty } from '@nestjs/swagger';

export class UploadImageReturnDto {
  @ApiProperty()
  image_url: string;
}
