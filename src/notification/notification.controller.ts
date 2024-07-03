import { Controller, Get, UseGuards, Request, Version, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Request as ExpressRequest } from 'express';
import { PaginationTransformPipe } from 'src/pipes/pagination-transform.pipe';
import { PaginationParams } from 'src/global/dtos/pagination-params.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiQuery, ApiTags } from '@nestjs/swagger';

@Controller('notification')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'pageSize',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'offset',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
  })
  @ApiTags('Notification: Get All')
  @ApiBearerAuth()
  //
  @Get()
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async getAll1(
    @Query(PaginationTransformPipe) paginationParams: PaginationParams,
    @Request() req: ExpressRequest,
  ) {
    return await this.notificationService.getAll(req['id'], paginationParams);
  }

  @ApiCreatedResponse({
    type: Number,
  })
  @ApiTags('Notification: Get New Notifications Count')
  @ApiBearerAuth()
  //
  @Get('newNotificationsCount')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async getNewNotificationsCount1(@Request() req: ExpressRequest) {
    return await this.notificationService.getNewNotificationsCount(req['id']);
  }
}
