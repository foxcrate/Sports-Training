import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { ALLOWED_PAGE_SIZES } from 'src/global/enums';

@Injectable()
export class PaginationTransformPipe implements PipeTransform<any, any> {
  constructor(private readonly i18n: I18nService) {}

  transform(value: any): any {
    const { page, pageSize, ...restBody } = value;

    const transformedPage = this.transformPage(page);
    const transformedPageSize = this.transformPageSize(pageSize);

    return {
      ...restBody,
      page: page,
      pageSize: pageSize,
      offset: transformedPage * transformedPageSize,
      limit: transformedPageSize,
    };
  }

  private transformPage(page: any): number {
    const parsedPage = parseInt(page || '1', 10);
    if (isNaN(parsedPage) || parsedPage < 1) {
      throw new BadRequestException(
        this.i18n.t(`errors.WRONG_PAGE_ERROR`, { lang: I18nContext.current().lang }),
      );
    }
    return parsedPage - 1;
  }

  private transformPageSize(pageSize: any): number {
    const parsedPageSize = parseInt(pageSize || `${ALLOWED_PAGE_SIZES[2]}`, 10);
    if (isNaN(parsedPageSize) || !ALLOWED_PAGE_SIZES.includes(parsedPageSize)) {
      throw new BadRequestException(
        this.i18n.t(`errors.WRONG_PAGE_SIZE_ERROR`, { lang: I18nContext.current().lang }),
      );
    }
    return parsedPageSize;
  }
}
