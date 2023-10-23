import {
  Controller,
  Get,
  UseGuards,
  Version,
  Request,
  Body,
  Param,
  Query,
  Post,
  Put,
  Delete,
} from '@nestjs/common';
import { FieldService } from './field.service';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Request as ExpressRequest, query } from 'express';
import { FieldSQLService } from './field-sql.service';
import { JoiValidation } from 'src/pipes/joi-validaiton.pipe';
import { AddFieldValidation } from './validations/create.validation';

@Controller('field')
export class FieldController {
  constructor(
    private fieldService: FieldService,
    private fieldSQLService: FieldSQLService,
  ) {}

  @Get('')
  @Version('1')
  // @Roles('user')
  // @UseGuards(AuthGuard, RoleGuard)
  async getAll1() {
    return this.fieldService.getAll();
  }

  @Get('/:id')
  @Version('1')
  // @Roles('user')
  // @UseGuards(AuthGuard, RoleGuard)
  async getOne1(@Param() params) {
    return this.fieldService.getOne(params.id);
  }

  @Post()
  @Version('1')
  // @Roles('user')
  // @UseGuards(AuthGuard, RoleGuard)
  async create1(
    @Body(new JoiValidation(AddFieldValidation)) reqBody,
    @Request() req: ExpressRequest,
  ) {
    return this.fieldService.create(reqBody);
  }

  @Put('/:id')
  @Version('1')
  // @Roles('user')
  // @UseGuards(AuthGuard, RoleGuard)
  async update1(@Param() params) {
    return this.fieldService.getOne(params.id);
  }

  @Delete('/:id')
  @Version('1')
  // @Roles('user')
  // @UseGuards(AuthGuard, RoleGuard)
  async delete1(@Param() params) {
    return this.fieldService.delete(params.id);
  }

  @Post('add-not-available-days')
  @Version('1')
  // @Roles('user')
  // @UseGuards(AuthGuard, RoleGuard)
  async addNotAvailableDays1(
    @Body(new JoiValidation(AddFieldValidation)) reqBody,
    @Request() req: ExpressRequest,
  ) {
    return this.fieldService.create(reqBody);
  }

  @Get('/:id/fieldDayAvailableHours/:date')
  @Version('1')
  // @Roles('user')
  // @UseGuards(AuthGuard, RoleGuard)
  async fieldDayAvailableHours1(
    @Body() reqBody,
    @Param() params,
    @Request() req: ExpressRequest,
  ) {
    return this.fieldService.fieldDayAvailableHours(params.id, params.date);
  }

  @Post('/:id/reserve-slot')
  @Version('1')
  // @Roles('user')
  // @UseGuards(AuthGuard, RoleGuard)
  async reserveSlot1(@Body() reqBody, @Param() params, @Request() req: ExpressRequest) {
    return this.fieldService.reserveSlot(params.id, 1, reqBody);
  }
}
