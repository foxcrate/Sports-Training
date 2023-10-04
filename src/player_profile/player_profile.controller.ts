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
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { PlayerProfileService } from './player_profile.service';
import { JoiValidation } from 'src/pipes/joi_validaiton.pipe';
import { AddPlayerProfileValidation } from 'src/player_profile/validations/create.validation';
import { AuthGuard } from 'src/guards/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleGuard } from 'src/guards/role.guard';

@Controller('player_profile')
export class PlayerProfileController {
  constructor(private playerProfileService: PlayerProfileService) {}

  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @Get()
  // @UsePipes(new JoiValidation(AddPlayerProfileValidation))
  async getOne1(@Body() reqBody, @Request() req: ExpressRequest) {
    return this.playerProfileService.getOne(req['id']);
  }

  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @Post()
  @UsePipes(new JoiValidation(AddPlayerProfileValidation))
  async create1(@Body() reqBody, @Request() req: ExpressRequest) {
    return this.playerProfileService.create(reqBody, req['id']);
  }

  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @Put()
  @UsePipes(new JoiValidation(AddPlayerProfileValidation))
  async update1(@Body() reqBody, @Request() req: ExpressRequest) {
    return this.playerProfileService.update(reqBody, req['id']);
  }

  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @Delete()
  async delete1(@Request() req: ExpressRequest) {
    return this.playerProfileService.delete(req['id']);
  }

  @Version('1')
  // @Roles('user')
  // @UseGuards(AuthGuard, RoleGuard)
  @Get('testHesham')
  async testHesham(@Request() req: ExpressRequest) {
    // return this.playerProfileService.testHesham();
  }
}
