import { Controller, Get } from '@nestjs/common';

@Controller('schedule')
export class ScheduleController {
  @Get()
  getTest() {
    return { test: 1 };
  }
}
