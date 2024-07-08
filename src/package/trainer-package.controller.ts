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
  //   @ApiNotFoundResponse(new SwaggerErrorResponse('TRAINER_PROFILE_NOT_FOUND').init())
  @ApiTags('Package: Trainer: Get One')
  @ApiBearerAuth()
  //
  @Get('')
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
