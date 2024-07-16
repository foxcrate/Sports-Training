import { BadRequestException, Injectable } from '@nestjs/common';
import { HomeModel } from './home.model';
import { SearchFiltersDto } from './dto/search-filters.dto';
import { HOME_SEARCH_TYPES_ENUM } from 'src/global/enums';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { SearchResultsDto } from './dto/search-result.dto';
import { ReturnSportDto } from 'src/sport/dtos/return.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class HomeService {
  constructor(
    private homeModel: HomeModel,
    private readonly i18n: I18nService,
    private prisma: PrismaService,
  ) {}

  async getSearchResults(filters: SearchFiltersDto): Promise<SearchResultsDto> {
    switch (filters.type) {
      case HOME_SEARCH_TYPES_ENUM.COACHES:
        return this.homeModel.getCoaches(filters);
      case HOME_SEARCH_TYPES_ENUM.DOCTORS:
        return this.homeModel.getDoctors(filters);
      case HOME_SEARCH_TYPES_ENUM.FIELDS:
        return this.homeModel.getFields(filters);
      case HOME_SEARCH_TYPES_ENUM.ALL:
        return this.homeModel.getAll(filters);
      default:
        throw new BadRequestException(
          this.i18n.t(`errors.WRONG_FILTER_TYPE`, { lang: I18nContext.current().lang }),
        );
    }
  }

  async getPlayerHome(userId: number): Promise<any> {
    // get sports
    let sports = await this.homeModel.getSports(userId);

    //get children names
    let children = await this.homeModel.getChildrenNames(userId);

    // get player sessions
    let upcomingSession = await this.homeModel.getPlayerSessions(userId);

    // get trainer packages for child
    let childPackages = await this.homeModel.getPackages(userId);
  }

  async getTrainerHome(userId: number): Promise<any> {
    // get sports fields
    let sportsFields = await this.homeModel.getSportsFields(userId);

    // get trainer sessions
    let upcomingSession = await this.homeModel.getTrainerSessions(userId);

    // get trainer pending sessions
    let pendingSession = await this.homeModel.getTrainerPendingSessions(userId);
  }

  async getChildHome(userId: number): Promise<any> {}
}
