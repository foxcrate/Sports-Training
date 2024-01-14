import {
  Controller,
  Get,
  UseGuards,
  Request,
  Version,
  Body,
  Param,
} from '@nestjs/common';
import { TrainerScheduleService } from './trainer-schedule.service';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Request as ExpressRequest } from 'express';
import { UserId } from 'src/decorators/user-id.decorator';

@Controller('admin/trainer-schedule')
export class AdminTrainerScheduleController {
  constructor(private scheduleService: TrainerScheduleService) {}

  @Get()
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async getAll1(@UserId() userId: number) {
    return await this.scheduleService.getAll(userId);
  }
}
