import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import moment from 'moment-timezone';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { PrismaService } from './prisma/prisma.service';
import { GlobalService } from './global/global.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private prisma: PrismaService,
    private readonly i18n: I18nService,
    private globalSerice: GlobalService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/test')
  async test() {
    return 'test route';
  }
}
