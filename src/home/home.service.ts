import { BadRequestException, Injectable } from '@nestjs/common';
import { HomeModel } from './home.model';
import { SearchFiltersDto } from './dto/search-filters.dto';
import { HOME_SEARCH_TYPES_ENUM } from 'src/global/enums';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { SearchResultsDto } from './dto/search-result.dto';
import { ReturnSportDto } from 'src/sport/dtos/return.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PlayerHomeDto } from './dto/player-home.dto';
import { TrainerHomeDto } from './dto/trainer-home.dto';
import { ChildHomeDto } from './dto/child-home.dto';
import { PlayerProfileRepository } from 'src/player-profile/player-profile.repository';
import { TrainerProfileRepository } from 'src/trainer-profile/trainer-profile.repository';

@Injectable()
export class HomeService {
  constructor(
    private homeModel: HomeModel,
    private readonly i18n: I18nService,
    private prisma: PrismaService,
    private playerProfileRepository: PlayerProfileRepository,
    private tainerProfileRepository: TrainerProfileRepository,
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

  async getPlayerHome(userId: number): Promise<PlayerHomeDto> {
    let playerProfile = await this.playerProfileRepository.getOneByUserId(userId);
    if (!playerProfile) {
      throw new BadRequestException(
        this.i18n.t(`errors.PLAYER_PROFILE_NOT_FOUND`, {
          lang: I18nContext.current().lang,
        }),
      );
    }
    // get sports
    let sports: any[] = await this.homeModel.getSports(userId);

    //get children names
    let childrenNames: any[] = await this.homeModel.getChildrenNames(userId);

    // get player sessions
    let upcomingSession: any[] = await this.homeModel.getPlayerSessions(userId);

    // get player ongoing session
    let ongoingSessions: any[] = await this.homeModel.getPlayerOngoingSessions(userId);

    // get trainer packages for child
    let packages: any[] = await this.homeModel.getPackages(userId);

    return {
      sports: sports,
      upcomingSession: upcomingSession,
      ongoingSessions: ongoingSessions,
      childrenNames: childrenNames,
      childPackages: packages,
    };
  }

  async getTrainerHome(userId: number): Promise<TrainerHomeDto> {
    let trainerProfile = await this.tainerProfileRepository.getByUserId(userId);
    // get sports fields
    let sportsFields: any[] = await this.homeModel.getSportsFields(userId);

    // get trainer sessions
    let upcomingSession: any[] = await this.homeModel.getTrainerSessions(userId);

    // get trainer pending sessions
    let pendingSession: any[] = await this.homeModel.getTrainerPendingSessions(userId);

    //get lst sessions trainees
    let lastSessionsTrainees: any[] =
      await this.homeModel.getLastSessionsTrainees(userId);

    return {
      sportsFields: sportsFields,
      upcomingSession: upcomingSession,
      pendingSession: pendingSession,
      lastSessionsTrainees: lastSessionsTrainees,
    };
  }

  async getChildHome(userId: number): Promise<ChildHomeDto> {
    let childProfile = await this.playerProfileRepository.getOneByUserId(userId);
    if (!childProfile) {
      throw new BadRequestException(
        this.i18n.t(`errors.PLAYER_PROFILE_NOT_FOUND`, {
          lang: I18nContext.current().lang,
        }),
      );
    }
    // get player sessions
    let upcomingSessions: any[] = await this.homeModel.getPlayerSessions(userId);

    // get player feedbacks
    let feedbacks: any[] = await this.homeModel.getPlayerFeedbacks(userId);

    return {
      upcomingSessions: upcomingSessions,
      feedbacks: feedbacks,
    };
  }
}
