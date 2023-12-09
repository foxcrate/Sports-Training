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
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Request as ExpressRequest, query } from 'express';
import { JoiValidation } from 'src/pipes/joi-validaiton.pipe';
import { AddFieldValidation } from './validations/create.validation';
import { UpdateFieldValidation } from './validations/update.validation';
import { FieldIdValidation } from './validations/field-id.validaiton';
import { AdminFieldService } from './admin-field.service';
import { NotAvailableDatesValidation } from './validations/not-available-dates.valdiaiton';
import { FieldAcceptanceStatusDto } from './dtos/field-acceptance-status.dto';

@Controller('admin/field')
export class AdminFieldController {
  constructor(private adminFieldService: AdminFieldService) {}

  @Get()
  @Version('1')
  @Roles('admin')
  @UseGuards(AuthGuard, RoleGuard)
  async getAll1() {
    return await this.adminFieldService.getAll();
  }

  @Post()
  @Version('1')
  @Roles('admin')
  @UseGuards(AuthGuard, RoleGuard)
  async create1(
    @Body(new JoiValidation(AddFieldValidation)) reqBody,
    @Request() req: ExpressRequest,
  ) {
    return await this.adminFieldService.create(reqBody);
  }

  @Put('/:id')
  @Version('1')
  @Roles('admin')
  @UseGuards(AuthGuard, RoleGuard)
  async update1(
    @Body(new JoiValidation(UpdateFieldValidation)) reqBody,
    @Param(new JoiValidation(FieldIdValidation)) params,
    @Request() req: ExpressRequest,
  ) {
    return await this.adminFieldService.update(params.id, reqBody);
  }

  @Delete('/:id')
  @Version('1')
  @Roles('admin')
  @UseGuards(AuthGuard, RoleGuard)
  async delete1(@Param() params) {
    return await this.adminFieldService.delete(params.id);
  }

  @Get('/pending-fields')
  @Version('1')
  @Roles('admin')
  @UseGuards(AuthGuard, RoleGuard)
  async getPendingFields1() {
    return await this.adminFieldService.getPendingFields();
  }

  @Put('/:id/accept-field-request')
  @Version('1')
  @Roles('admin')
  @UseGuards(AuthGuard, RoleGuard)
  async acceptFieldRequest1(@Param(new JoiValidation(FieldIdValidation)) params) {
    return await this.adminFieldService.changeFieldAcceptanceStatue(
      params.id,
      FieldAcceptanceStatusDto.Accepted,
    );
  }

  @Put('/:id/decline-field-request')
  @Version('1')
  @Roles('admin')
  @UseGuards(AuthGuard, RoleGuard)
  async declineFieldRequest1(@Param(new JoiValidation(FieldIdValidation)) params) {
    return await this.adminFieldService.changeFieldAcceptanceStatue(
      params.id,
      FieldAcceptanceStatusDto.Declined,
    );
  }

  @Post('/:id/add-not-available-days')
  @Version('1')
  @Roles('admin')
  @UseGuards(AuthGuard, RoleGuard)
  async addNotAvailableDays1(
    @Body(new JoiValidation(NotAvailableDatesValidation)) reqBody,
    @Param(new JoiValidation(FieldIdValidation)) params,
    @Request() req: ExpressRequest,
  ) {
    return await this.adminFieldService.addNotAvailableDays(
      Number(params.id),
      reqBody.notAvailableDays,
    );
  }

  @Get('/:id')
  @Version('1')
  @Roles('admin')
  @UseGuards(AuthGuard, RoleGuard)
  async getOne1(@Param(new JoiValidation(FieldIdValidation)) params) {
    return await this.adminFieldService.getOne(params.id);
  }
}
