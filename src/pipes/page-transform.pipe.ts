import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export default class PageTransformPipe implements PipeTransform<string, number> {
  constructor(private readonly i18n: I18nService) {}

  transform(value: string): number {
    const parsedValue = parseInt(value || `1`, 10);
    if (isNaN(parsedValue) || parsedValue < 1) {
      throw new BadRequestException(
        this.i18n.t(`errors.WRONG_PAGE_ERROR`, { lang: I18nContext.current().lang }),
      );
    }
    const transformedPage = parsedValue - 1;
    return transformedPage;
  }
}
