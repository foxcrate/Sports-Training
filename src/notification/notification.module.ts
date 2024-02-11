import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationModel } from './notification.model';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService, NotificationModel],
  imports: [],
  exports: [NotificationModel],
})
export class NotificationModule {}
