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
import { TrainerProfileService } from './trainer-profile.service';
import { JoiValidation } from 'src/pipes/joi-validaiton.pipe';
import { AddTrainerProfileValidation } from 'src/trainer-profile/validations/create.validation';
import { AuthGuard } from 'src/guards/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleGuard } from 'src/guards/role.guard';

@Controller('trainer-profile')
export class TrainerProfileController {
  constructor(private trainerProfileService: TrainerProfileService) {}

  @Get()
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async getOne1(@Body() reqBody, @Request() req: ExpressRequest) {
    return await this.trainerProfileService.getOne(req['id']);
  }

  @Post()
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @UsePipes(new JoiValidation(AddTrainerProfileValidation))
  async create1(@Body() reqBody, @Request() req: ExpressRequest) {
    return await this.trainerProfileService.create(reqBody, req['id']);
  }

  @Put()
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @UsePipes(new JoiValidation(AddTrainerProfileValidation))
  async update1(@Body() reqBody, @Request() req: ExpressRequest) {
    return await this.trainerProfileService.update(reqBody, req['id']);
  }

  @Delete()
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async delete1(@Request() req: ExpressRequest) {
    return await this.trainerProfileService.delete(req['id']);
  }

  @Get('testHesham')
  @Version('1')
  // @Roles('user')
  // @UseGuards(AuthGuard, RoleGuard)
  async testHesham(@Request() req: ExpressRequest) {
    // return this.trainerProfileService.testHesham();
  }
}
