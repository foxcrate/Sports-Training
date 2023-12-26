import { Module } from '@nestjs/common';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { ScheduleModule } from './schedule/schedule.module';

@Module({
  controllers: [CalendarController],
  providers: [CalendarService],
  imports: [ScheduleModule]
})
export class CalendarModule {}
