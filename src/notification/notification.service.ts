import { Injectable } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import { PaginationParams } from 'src/global/dtos/pagination-params.dto';

@Injectable()
export class NotificationService {
  constructor(private notificationRepository: NotificationRepository) {}

  async getAll(userId: number, paginationParams: PaginationParams): Promise<any> {
    return await this.notificationRepository.getAll(userId, paginationParams);
  }

  async getNewNotificationsCount(userId: number): Promise<number> {
    return await this.notificationRepository.getNewNotificationsCount(userId);
  }
}
