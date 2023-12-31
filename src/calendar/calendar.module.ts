import { Module } from '@nestjs/common';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { CalendarModel } from './calendar.model';

@Module({
  controllers: [CalendarController],
  providers: [CalendarService, CalendarModel],
})
export class CalendarModule {}
