import {
  Controller,
  Post,
  UseGuards,
  Version,
  Request,
  UsePipes,
  Body,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { JoiValidation } from 'src/pipes/joi_validaiton.pipe';
import { AuthGuard } from 'src/guards/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleGuard } from 'src/guards/role.guard';
import { SportService } from './sport.service';
import { AddSportValidation } from './validations/create.validation';

@Controller('sport')
export class SportController {
  constructor(private sportService: SportService) {}

  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @Post()
  @UsePipes(new JoiValidation(AddSportValidation))
  async create1(@Body() reqBody, @Request() req: ExpressRequest) {
    return this.sportService.create(reqBody, req['id']);
    // return 'Alo';
  }
}
