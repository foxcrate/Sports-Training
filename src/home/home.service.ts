import { BadRequestException, Injectable } from '@nestjs/common';
import { HomeRepository } from './home.repository';
import { SearchFiltersDto } from './dto/search-filters.dto';
import { HOME_SEARCH_TYPES_ENUM } from 'src/global/enums';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { SearchResultsDto } from './dto/search-result.dto';
import { PlayerHomeDto } from './dto/player-home.dto';
import { TrainerHomeDto } from './dto/trainer-home.dto';
import { ChildHomeDto } from './dto/child-home.dto';
import { PlayerProfileRepository } from 'src/player-profile/player-profile.repository';
import { TrainerProfileRepository } from 'src/trainer-profile/trainer-profile.repository';
import { UserRepository } from 'src/user/user.repository';
import { UserInfoDto } from './dto/user-info.dto';
import { FIND_BY } from 'src/trainer-profile/trainer-profile-enums';

@Injectable()
export class HomeService {
  constructor(
    private homeRepository: HomeRepository,
    private readonly i18n: I18nService,
    private playerProfileRepository: PlayerProfileRepository,
    private tainerProfileRepository: TrainerProfileRepository,
    private userRepository: UserRepository,
  ) {}

  async getSearchResults(filters: SearchFiltersDto): Promise<SearchResultsDto> {
    switch (filters.type) {
      case HOME_SEARCH_TYPES_ENUM.COACHES:
        return this.homeRepository.getCoaches(filters);
      case HOME_SEARCH_TYPES_ENUM.DOCTORS:
        return this.homeRepository.getDoctors(filters);
      case HOME_SEARCH_TYPES_ENUM.FIELDS:
        return this.homeRepository.getFields(filters);
      case HOME_SEARCH_TYPES_ENUM.ALL:
        return this.homeRepository.getAll(filters);
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
    let sports: any[] = await this.homeRepository.getSports(userId);

    //get children names
    let childrenNames: any[] = await this.homeRepository.getChildrenNames(userId);

    // get player sessions
    let upcomingSession: any[] = await this.homeRepository.getPlayerSessions(userId);

    // get player ongoing session
    let ongoingSessions: any[] =
      await this.homeRepository.getPlayerOngoingSessions(userId);

    // get trainer packages for child
    let packages: any[] = await this.homeRepository.getPackages(userId);

    let theUser = await this.userRepository.getById(userId);
    let theUserInfo: UserInfoDto = {
      id: theUser.id,
      firstName: theUser.firstName,
      lastName: theUser.lastName,
      profileImage: theUser.profileImage,
      mobileNumber: theUser.mobileNumber,
    };

    return {
      userInfo: theUserInfo,
      sports: sports,
      upcomingSession: upcomingSession,
      ongoingSessions: ongoingSessions,
      childrenNames: childrenNames,
      childPackages: packages,
    };
  }

  async getTrainerHome(userId: number): Promise<TrainerHomeDto> {
    let trainerProfile = await this.tainerProfileRepository.findBy(
      FIND_BY.USER_ID,
      userId,
    );
    // get sports fields
    let sportsFields: any[] = await this.homeRepository.getSportsFields(userId);

    // get trainer sessions
    let upcomingSession: any[] = await this.homeRepository.getTrainerSessions(userId);

    // get trainer pending sessions
    let pendingSession: any[] =
      await this.homeRepository.getTrainerPendingSessions(userId);

    //get lst sessions trainees
    let lastSessionsTrainees: any[] =
      await this.homeRepository.getLastSessionsTrainees(userId);

    let theUser = await this.userRepository.getById(userId);
    let theUserInfo: UserInfoDto = {
      id: theUser.id,
      firstName: theUser.firstName,
      lastName: theUser.lastName,
      profileImage: theUser.profileImage,
      mobileNumber: theUser.mobileNumber,
    };

    return {
      userInfo: theUserInfo,
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

    let theUser = await this.userRepository.getById(userId);
    let theUserInfo: UserInfoDto = {
      id: theUser.id,
      firstName: theUser.firstName,
      lastName: theUser.lastName,
      profileImage: theUser.profileImage,
      mobileNumber: theUser.mobileNumber,
    };
    // get player sessions
    let upcomingSessions: any[] = await this.homeRepository.getPlayerSessions(userId);

    // get player feedbacks
    let feedbacks: any[] = await this.homeRepository.getPlayerFeedbacks(userId);

    return {
      userInfo: theUserInfo,
      upcomingSessions: upcomingSessions,
      feedbacks: feedbacks,
    };
  }
}
