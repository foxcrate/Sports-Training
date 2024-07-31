import {
  Controller,
  Post,
  UseGuards,
  Version,
  Request,
  UsePipes,
  Body,
  Delete,
  Get,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { PlayerProfileService } from './player-profile.service';
import { JoiValidation } from 'src/pipes/joi-validaiton.pipe';
import { AddPlayerProfileValidation } from 'src/player-profile/validations/create.validation';
import { AuthGuard } from 'src/guards/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleGuard } from 'src/guards/role.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ReturnPlayerProfileDto } from './dtos/return.dto';
import { SwaggerErrorResponse } from 'src/global/classes/swagger-error-response';
import { PlayerProfileCreateDto } from './dtos/create.dto';

@Controller('player-profile')
export class PlayerProfileController {
  constructor(private playerProfileService: PlayerProfileService) {}

  @ApiCreatedResponse({
    type: ReturnPlayerProfileDto,
  })
  @ApiTags('Player-Profile: Get One')
  @ApiBearerAuth()
  //
  @Get()
  @Version('1')
  @Roles('user', 'child')
  @UseGuards(AuthGuard, RoleGuard)
  // @UsePipes(new JoiValidation(AddPlayerProfileValidation))
  async getOne1(@Body() reqBody, @Request() req: ExpressRequest) {
    return await this.playerProfileService.getOne(req['id']);
  }

  @ApiBody({
    type: PlayerProfileCreateDto,
  })
  @ApiCreatedResponse({
    type: ReturnPlayerProfileDto,
  })
  @ApiTags('Player-Profile: Set')
  @ApiBearerAuth()
  //
  @Post()
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @UsePipes(new JoiValidation(AddPlayerProfileValidation))
  async set1(@Body() reqBody, @Request() req: ExpressRequest) {
    return await this.playerProfileService.set(reqBody, req['id']);
  }

  @ApiCreatedResponse({
    type: ReturnPlayerProfileDto,
  })
  @ApiNotFoundResponse(new SwaggerErrorResponse('RECORD_NOT_FOUND').init())
  @ApiTags('Player-Profile: Delete')
  @ApiBearerAuth()
  //
  @Delete()
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async delete1(@Request() req: ExpressRequest) {
    return await this.playerProfileService.delete(req['id']);
  }
}
