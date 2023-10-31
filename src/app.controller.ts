import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import * as moment from 'moment-timezone';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly i18n: I18nService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/test')
  testTime(): moment.Moment {
    let dateFromRequest = '2023-10-30T07:00';
    // moment.locale('ar');
    // moment.tz.setDefault('America/New_York');
    // let localtz = moment.tz.guess();
    let jun: moment.Moment = moment.tz(dateFromRequest, 'Europe/London');

    // let b = moment.tz(jun, 'America/Toronto');
    // return b.locale(I18nContext.current().lang).format('YYYY-MM-DDThh:mm:ss');
    // return jun.tz('Africa/Cairo').format('kk:mm');
    // console.log({ localtz });
    console.log({ jun });
    let junFormated = jun.format();
    console.log({ junFormated });

    let junDate = new Date(jun.format());

    console.log({ junDate });

    return jun;
    // return this.appService.getHello();
  }
}
