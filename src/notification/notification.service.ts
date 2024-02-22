import { Injectable } from '@nestjs/common';
import { NotificationModel } from './notification.model';
import { PaginationParams } from 'src/global/dtos/pagination-params.dto';

@Injectable()
export class NotificationService {
  constructor(private notificationModel: NotificationModel) {}

  async getAll(userId: number, paginationParams: PaginationParams): Promise<any> {
    return await this.notificationModel.getAll(userId, paginationParams);
  }

  async getNewNotificationsCount(userId: number): Promise<number> {
    return await this.notificationModel.getNewNotificationsCount(userId);
  }
}
