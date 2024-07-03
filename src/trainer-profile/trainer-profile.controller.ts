import {
  Controller,
  Post,
  UseGuards,
  Version,
  Request,
  UsePipes,
  Body,
  Put,
  Delete,
  Get,
  Param,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { TrainerProfileService } from './trainer-profile.service';
import { JoiValidation } from 'src/pipes/joi-validaiton.pipe';
import { AddTrainerProfileValidation } from 'src/trainer-profile/validations/create.validation';
import { AuthGuard } from 'src/guards/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleGuard } from 'src/guards/role.guard';
import { NotAvailableDatesValidation } from 'src/field/validations/not-available-dates.valdiaiton';
import { TrainerProfileIdValidation } from './validations/trainer-profile-id.validation';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { SwaggerErrorResponse } from 'src/global/classes/swagger-error-response';
import { ReturnTrainerProfileDto } from './dtos/return.dto';
import { TrainerProfileCreateDto } from './dtos/create.dto';
import { ReturnTrainerProfileDetailsDto } from './dtos/details-return.dto';

@Controller('trainer-profile')
export class TrainerProfileController {
  constructor(private trainerProfileService: TrainerProfileService) {}

  @ApiCreatedResponse({
    type: ReturnTrainerProfileDetailsDto,
  })
  @ApiTags('Trainer-Profile: Get One')
  @ApiBearerAuth()
  //
  @Get()
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async getOne1(@Body() reqBody, @Request() req: ExpressRequest) {
    return await this.trainerProfileService.getOne(req['id']);
  }

  @ApiParam({
    name: 'trainerProfileId',
  })
  @ApiCreatedResponse({
    type: ReturnTrainerProfileDetailsDto,
  })
  @ApiNotFoundResponse(new SwaggerErrorResponse('RECORD_NOT_FOUND').init())
  @ApiTags('Trainer-Profile: Get Trainer')
  @ApiBearerAuth()
  //
  @Get('get-trainer/:trainerProfileId')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async playerGetOne1(@Param(new JoiValidation(TrainerProfileIdValidation)) params) {
    return await this.trainerProfileService.playerGetOne(params.trainerProfileId);
  }

  @ApiBody({
    type: TrainerProfileCreateDto,
  })
  @ApiCreatedResponse({
    type: ReturnTrainerProfileDetailsDto,
  })
  @ApiTags('Trainer-Profile: Create')
  @ApiBearerAuth()
  //
  @Post()
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @UsePipes(new JoiValidation(AddTrainerProfileValidation))
  async create1(@Body() reqBody, @Request() req: ExpressRequest) {
    return await this.trainerProfileService.create(reqBody, req['id']);
  }

  @ApiBody({
    type: TrainerProfileCreateDto,
  })
  @ApiCreatedResponse({
    type: ReturnTrainerProfileDetailsDto,
  })
  @ApiTags('Trainer-Profile: Update')
  @ApiBearerAuth()
  //
  @Put()
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @UsePipes(new JoiValidation(AddTrainerProfileValidation))
  async update1(@Body() reqBody, @Request() req: ExpressRequest) {
    return await this.trainerProfileService.update(reqBody, req['id']);
  }

  @ApiCreatedResponse({
    type: ReturnTrainerProfileDto,
  })
  @ApiNotFoundResponse(new SwaggerErrorResponse('RECORD_NOT_FOUND').init())
  @ApiTags('Trainer-Profile: Delete')
  @ApiBearerAuth()
  //
  @Delete()
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async delete1(@Request() req: ExpressRequest) {
    return await this.trainerProfileService.delete(req['id']);
  }

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        notAvailableDays: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
      },
    },
  })
  @ApiCreatedResponse({
    type: ReturnTrainerProfileDto,
  })
  @ApiNotFoundResponse(new SwaggerErrorResponse('TRAINER_PROFILE_NOT_FOUND').init())
  @ApiTags('Trainer-Profile: Add Not Available Days')
  @ApiBearerAuth()
  //
  @Post('/add-not-available-days')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async addNotAvailableDays1(
    @Body(new JoiValidation(NotAvailableDatesValidation)) reqBody,
    @Request() req: ExpressRequest,
  ) {
    return await this.trainerProfileService.addNotAvailableDays(
      req['id'],
      reqBody.notAvailableDays,
    );
  }
}
