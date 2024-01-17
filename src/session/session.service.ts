import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { RateSessionDto } from './dtos/rate-session.dto';
import { SessionModel } from './session.model';
import { PlayerProfileModel } from 'src/player-profile/player-profile.model';

@Injectable()
export class SessionService {
  constructor(
    private readonly i18n: I18nService,
    private sessionModel: SessionModel,
    private playerProfileModel: PlayerProfileModel,
  ) {}

  async playerRateSession(userId: number, reqBody: RateSessionDto) {
    // throw an error if playerProfile don't exist
    let thePlayerProfile = await this.playerProfileModel.getOneByUserId(userId);
    if (!thePlayerProfile) {
      throw new NotFoundException(
        this.i18n.t(`errors.PLAYER_PROFILE_NOT_FOUND`, {
          lang: I18nContext.current().lang,
        }),
      );
    }

    // throw error if session don't exist
    let theSession = await this.sessionModel.getBookedSessionBySessionId(
      reqBody.sessionId,
    );

    await this.validatePlayerRatingSession(thePlayerProfile.userId, theSession.userId);
    await this.sessionModel.savePlayerSessionRating(
      thePlayerProfile.userId,
      theSession.id,
      reqBody.ratingNumber,
      reqBody.feedback,
    );
    return true;
  }

  private async validatePlayerRatingSession(userId: number, sessionUserID: number) {
    //check if this session is done by this trainer
    if (sessionUserID != userId) {
      throw new BadRequestException(
        this.i18n.t(`errors.WRONG_TRAINER_SESSION_MIX`, {
          lang: I18nContext.current().lang,
        }),
      );
    }
  }
}
