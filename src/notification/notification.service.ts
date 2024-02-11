import { Injectable } from '@nestjs/common';
import { NotificationModel } from './notification.model';

@Injectable()
export class NotificationService {
  constructor(private notificationModel: NotificationModel) {}

  async getAll(userId: number): Promise<any> {
    return await this.notificationModel.getAll(userId);
  }

  async getNewNotificationsCount(userId: number): Promise<number> {
    return await this.notificationModel.getNewNotificationsCount(userId);
  }
}
