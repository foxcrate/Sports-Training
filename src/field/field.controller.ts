import { Controller, Get, UseGuards, Version, Request, Body } from '@nestjs/common';
import { FieldService } from './field.service';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Request as ExpressRequest } from 'express';

@Controller('field')
export class FieldController {
  constructor(private fieldService: FieldService) {}

  @Get()
  @Version('1')
  // @Roles('user')
  // @UseGuards(AuthGuard, RoleGuard)
  async test(@Body() reqBody, @Request() req: ExpressRequest) {
    // return this.fieldService.checkFieldAvailability(
    //   1,
    //   '2023-10-15 10:30:00.000',
    //   '2023-10-15 11:00:00.000',
    // );
    return this.fieldService.fieldDayAvailableHours('2023-10-18T08:00:00.000Z');
  }
}
