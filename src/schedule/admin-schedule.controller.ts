import {
  Controller,
  Get,
  UseGuards,
  Request,
  Version,
  Body,
  Param,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Request as ExpressRequest } from 'express';

@Controller('admin/trainer-schedule')
export class AdminScheduleController {
  constructor(private scheduleService: ScheduleService) {}

  @Get()
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async getAll1(@Body() reqBody, @Param() params, @Request() req: ExpressRequest) {
    return await this.scheduleService.getAll(req['id']);
  }
}
