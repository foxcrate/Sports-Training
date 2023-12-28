import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { ALLOWED_PAGE_SIZES } from 'src/utils/enums';

@Injectable()
export default class PageSizeTransformPipe implements PipeTransform<string, number> {
  constructor(private readonly i18n: I18nService) {}

  transform(value: string): number {
    const parsedValue = parseInt(value || `${ALLOWED_PAGE_SIZES[0]}`, 10);
    if (isNaN(parsedValue) || !ALLOWED_PAGE_SIZES.includes(parsedValue)) {
      throw new BadRequestException(
        this.i18n.t(`errors.WRONG_PAGE_SIZE_ERROR`, { lang: I18nContext.current().lang }),
      );
    }
    return parsedValue;
  }
}
