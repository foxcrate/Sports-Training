import { Body, Controller, Post, UseGuards, Version } from '@nestjs/common';
import { PackageService } from './package.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SwaggerErrorResponse } from 'src/global/classes/swagger-error-response';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { JoiValidation } from 'src/pipes/joi-validaiton.pipe';
import { UserId } from 'src/decorators/user-id.decorator';
import { BookTrainerPackageValidation } from './validations/book-trianer-package.validation';
import { BookTrainerPackageDto } from './dtos/book-trainer-package.dto';

@Controller('player/package')
export class PlayerPackageController {
  constructor(private packageService: PackageService) {}

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        trainerProfileId: {
          type: 'number',
        },
        packageId: {
          type: 'number',
        },
      },
    },
  })
  @ApiCreatedResponse({
    // type: SessionCardDTO,
  })
  @ApiBadRequestResponse(new SwaggerErrorResponse('PASSED_DATE').init())
  @ApiTags('Package: User: Book Package')
  @ApiBearerAuth()
  //
  @Post('/book-package')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async bookTrainerPackage(
    @Body(new JoiValidation(BookTrainerPackageValidation)) reqBody: BookTrainerPackageDto,
    @UserId() userId: number,
  ) {
    return await this.packageService.playerBookTrainerPackage(
      userId,
      reqBody.trainerProfileId,
      reqBody.packageId,
    );
  }
}
