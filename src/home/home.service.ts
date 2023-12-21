import { BadRequestException, Injectable } from '@nestjs/common';
import { HomeModel } from './home.model';
import { SearchFiltersDto } from './dto/search-filters.dto';
import { HOME_SEARCH_TYPES_ENUM } from 'src/utils/enums';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class HomeService {
  constructor(
    private homeModel: HomeModel,
    private readonly i18n: I18nService,
  ) {}

  async getSearchResults(filters: SearchFiltersDto) {
    switch (filters.type) {
      case HOME_SEARCH_TYPES_ENUM.COACHES:
        return this.homeModel.getCoaches(filters);
      case HOME_SEARCH_TYPES_ENUM.DOCTORS:
        return this.homeModel.getDoctors(filters);
      case HOME_SEARCH_TYPES_ENUM.FIELDS:
        return this.homeModel.getFields(filters);
      default:
        throw new BadRequestException(
          this.i18n.t(`errors.WRONG_FILTER_TYPE`, { lang: I18nContext.current().lang }),
        );
    }
  }
}
