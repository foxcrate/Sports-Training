import { Body, Controller, Get, Param, Post, UseGuards, Version } from '@nestjs/common';
import { PackageService } from './package.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { SwaggerErrorResponse } from 'src/global/classes/swagger-error-response';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { JoiValidation } from 'src/pipes/joi-validaiton.pipe';
import { UserId } from 'src/decorators/user-id.decorator';
import { CreatePackageValidation } from './validations/create-package.validation';
import { PackageCreateDto } from './dtos/package-create.dto';
import { PackageReturnDto } from './dtos/package-return.dto';
import { PackageIdValidation } from './validations/package-id.validation';

@Controller('trainer/package')
export class TrainerPackageController {
  constructor(private packageService: PackageService) {}

  @ApiBody({
    type: PackageCreateDto,
    examples: {
      a: {
        summary: 'Create Package Example',
        value: {
          name: 'Basic Package',
          description: 'Basic Package Description',
          type: 'flexible or schedule',
          numberOfSessions: 2,
          minAttendees: 1,
          maxAttendees: 5,
          price: 100,
          ExpirationDate: '2024-12-31',
          fieldId: 1,
          secondaryFieldId: 2,
          sessionsDateTime: [
            {
              date: '2024-01-01',
              fromTime: '10:00',
              toTime: '11:00',
            },
            {
              date: '2024-01-01',
              fromTime: '12:00',
              toTime: '13:00',
            },
          ],
        },
      },
    },
  })
  @ApiCreatedResponse({
    type: PackageReturnDto,
  })
  @ApiNotFoundResponse(new SwaggerErrorResponse('TRAINER_PROFILE_NOT_FOUND').init())
  @ApiTags('Package: Trainer: Create')
  @ApiBearerAuth()
  //
  @Post('')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async create(
    @Body(new JoiValidation(CreatePackageValidation)) reqBody: PackageCreateDto,
    @UserId() userId: number,
  ) {
    return await this.packageService.create(reqBody, userId);
  }

  @ApiParam({
    name: 'packageId',
  })
  @ApiCreatedResponse({
    type: PackageReturnDto,
  })
  @ApiNotFoundResponse(new SwaggerErrorResponse('RECORD_NOT_FOUND').init())
  @ApiTags('Package: Trainer: Get One')
  @ApiBearerAuth()
  //
  @Get('/:packageId')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async getOne(
    @Param(new JoiValidation(PackageIdValidation)) params,
    @UserId() userId: number,
  ) {
    return await this.packageService.GetOne(Number(params.packageId), userId);
  }
}
