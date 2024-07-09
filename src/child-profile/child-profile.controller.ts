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
import { ChildProfileService } from './child-profile.service';
import { JoiValidation } from 'src/pipes/joi-validaiton.pipe';
import { AddPlayerProfileValidation } from '../player-profile/validations/create.validation';
import { DeleteChildProfileValidation } from '../child-profile/validations/delete.validation';
import { GetOneChildProfileValidation } from './validations/get-one.validation';
import { AuthGuard } from 'src/guards/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleGuard } from 'src/guards/role.guard';
import { ChildIdValidation } from './validations/child-id.validation';
import { ChildProfileIdValidation } from './validations/child-profile-id.validaiton';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { SwaggerErrorResponse } from 'src/global/classes/swagger-error-response';
import { PlayerProfileCreateDto } from 'src/player-profile/dtos/create.dto';
import { ReturnPlayerProfileDto } from 'src/player-profile/dtos/return.dto';
import { ReturnPlayerProfileWithUserAndSportsDto } from 'src/player-profile/dtos/return-with-user-and-sports.dto';

@Controller('child-profile')
export class ChildProfileController {
  constructor(private childProfileService: ChildProfileService) {}

  @ApiParam({
    name: 'childId',
    required: false,
  })
  @ApiBody({
    type: PlayerProfileCreateDto,
  })
  @ApiCreatedResponse({
    type: ReturnPlayerProfileDto,
  })
  @ApiForbiddenResponse(new SwaggerErrorResponse('NOT_ALLOWED').init())
  @ApiTags('Child-Profile: Create')
  @ApiBearerAuth()
  //
  @Post('/:childId')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async create1(
    @Body(new JoiValidation(AddPlayerProfileValidation)) reqBody,
    @Param(new JoiValidation(ChildIdValidation)) params,
    @Request() req: ExpressRequest,
  ) {
    return await this.childProfileService.create(reqBody, params.childId, req['id']);
  }

  @ApiParam({
    name: 'childProfileId',
    required: false,
  })
  @ApiBody({
    type: PlayerProfileCreateDto,
  })
  @ApiCreatedResponse({
    type: ReturnPlayerProfileDto,
  })
  @ApiNotFoundResponse(new SwaggerErrorResponse('RECORD_NOT_FOUND').init())
  @ApiTags('Child-Profile: Update')
  @ApiBearerAuth()
  //
  @Put('/:childProfileId')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  // @UsePipes(new JoiValidation(UpdateChildProfileValidation))
  async update1(
    @Body(new JoiValidation(AddPlayerProfileValidation)) reqBody,
    @Param(new JoiValidation(ChildProfileIdValidation)) params,
    @Request() req: ExpressRequest,
  ) {
    return await this.childProfileService.update(
      reqBody,
      params.childProfileId,
      req['id'],
    );
  }

  @ApiParam({
    name: 'childProfileId',
    required: false,
  })
  @ApiCreatedResponse({
    type: ReturnPlayerProfileDto,
  })
  @ApiNotFoundResponse(new SwaggerErrorResponse('RECORD_NOT_FOUND').init())
  @ApiTags('Child-Profile: Delete')
  @ApiBearerAuth()
  //
  @Delete('/:childProfileId')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @UsePipes(new JoiValidation(DeleteChildProfileValidation))
  async delete1(@Param() params, @Request() req: ExpressRequest) {
    const childProfileId = params.childProfileId;
    return await this.childProfileService.delete(req['id'], childProfileId);
  }

  @ApiCreatedResponse({
    type: ReturnPlayerProfileWithUserAndSportsDto,
    isArray: true,
  })
  @ApiTags('Child-Profile: Get All')
  @ApiBearerAuth()
  //
  @Get()
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async getAll1(@Request() req: ExpressRequest) {
    return await this.childProfileService.getAll(req['id']);
  }

  @ApiParam({
    name: 'childProfileId',
    required: false,
  })
  @ApiCreatedResponse({
    type: ReturnPlayerProfileWithUserAndSportsDto,
  })
  @ApiNotFoundResponse(new SwaggerErrorResponse('RECORD_NOT_FOUND').init())
  @ApiTags('Child-Profile: GetOne')
  @ApiBearerAuth()
  //
  @Get('/:childProfileId')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @UsePipes(new JoiValidation(GetOneChildProfileValidation))
  async getOne1(@Param() params, @Request() req: ExpressRequest) {
    const childProfileId = params.childProfileId;

    return await this.childProfileService.getOne(req['id'], childProfileId);
  }
}
