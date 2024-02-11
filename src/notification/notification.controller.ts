import { Controller, Get, UseGuards, Request, Version } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Request as ExpressRequest } from 'express';

@Controller('notification')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get()
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async getAll1(@Request() req: ExpressRequest) {
    return await this.notificationService.getAll(req['id']);
  }

  @Get('newNotificationsCount')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async getNewNotificationsCount1(@Request() req: ExpressRequest) {
    return await this.notificationService.getNewNotificationsCount(req['id']);
  }
}
