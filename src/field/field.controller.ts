import {
  Controller,
  Get,
  UseGuards,
  Version,
  Request,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { FieldService } from './field.service';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Request as ExpressRequest, query } from 'express';
import { FieldSQLService } from './field-sql.service';

@Controller('field')
export class FieldController {
  constructor(
    private fieldService: FieldService,
    private fieldSQLService: FieldSQLService,
  ) {}

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
}
