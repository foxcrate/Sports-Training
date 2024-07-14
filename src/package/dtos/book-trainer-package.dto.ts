import { ApiProperty } from '@nestjs/swagger';

export class BookTrainerPackageDto {
  @ApiProperty()
  trainerProfileId: number;

  @ApiProperty()
  packageId: number;
}
