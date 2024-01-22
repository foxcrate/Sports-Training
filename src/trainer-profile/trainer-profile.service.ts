import { Injectable, NotFoundException } from '@nestjs/common';
import { TrainerProfileCreateDto } from 'src/trainer-profile/dtos/create.dto';
import { ReturnTrainerProfileDto } from './dtos/return.dto';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { TrainerProfileModel } from './trainer-profile.model';
import { ReturnTrainerProfileDetailsDto } from './dtos/details-return.dto';
import { TrainerScheduleModel } from 'src/trainer-schedule/trainer-schedule.model';

@Injectable()
export class TrainerProfileService {
  constructor(
    private trainerProfileModel: TrainerProfileModel,
    private trainerScheduleModel: TrainerScheduleModel,

    private readonly i18n: I18nService,
  ) {}

  async getOne(userId): Promise<ReturnTrainerProfileDetailsDto> {
    let trainerProfileWithSports = await this.trainerProfileModel.getOneDetailed(userId);
    if (!trainerProfileWithSports) {
      throw new NotFoundException(
        this.i18n.t(`errors.RECORD_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
    }

    return trainerProfileWithSports;
  }

  async playerGetOne(trainerProfileId: number): Promise<ReturnTrainerProfileDetailsDto> {
    let trainerProfile = await this.trainerProfileModel.getByID(trainerProfileId);
    let trainerProfileWithSports = await this.trainerProfileModel.getOneDetailed(
      trainerProfile.userId,
    );
    if (!trainerProfileWithSports) {
      throw new NotFoundException(
        this.i18n.t(`errors.RECORD_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
    }

    return trainerProfileWithSports;
  }

  async create(createData: TrainerProfileCreateDto, userId): Promise<any> {
    // console.log(createData);
    // return createData;

    await this.trainerProfileModel.findRepeated(userId);

    return await this.trainerProfileModel.create(createData, userId);
  }

  async update(
    createData: TrainerProfileCreateDto,
    userId,
  ): Promise<ReturnTrainerProfileDetailsDto> {
    //check profile existence
    let trainerProfile = await this.trainerProfileModel.getByUserId(userId);
    if (!trainerProfile) {
      throw new NotFoundException(
        this.i18n.t(`errors.RECORD_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
    }

    let updatedPlayerProfile = await this.trainerProfileModel.update(createData, userId);

    return updatedPlayerProfile;
  }

  async delete(userId): Promise<ReturnTrainerProfileDto> {
    //get deleted playerProfile
    let deletedTrainerProfile = await this.trainerProfileModel.getByUserId(userId);

    if (!deletedTrainerProfile) {
      throw new NotFoundException(
        this.i18n.t(`errors.RECORD_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
    }

    //delete playerProfileSports
    Promise.all([
      await this.trainerProfileModel.deletePastTrainerSports(deletedTrainerProfile.id),
      await this.trainerProfileModel.deletePastTrainerFields(deletedTrainerProfile.id),
      await this.trainerProfileModel.deletePastTrainerImages(deletedTrainerProfile.id),
      await this.trainerProfileModel.deletePastTrainerCertificates(
        deletedTrainerProfile.id,
      ),
      await this.trainerProfileModel.deletePastNotAvailableDays(deletedTrainerProfile.id),
      await this.trainerProfileModel.deletePastBookedSessions(deletedTrainerProfile.id),
      await this.trainerScheduleModel.deleteByTrainerProfileId(deletedTrainerProfile.id),
    ]);
    // await this.trainerProfileModel.deletePastTrainerSports(deletedTrainerProfile.id);
    // await this.trainerProfileModel.deletePastTrainerFields(deletedTrainerProfile.id);

    //delete schedule sessions

    //delete
    await this.trainerProfileModel.deleteByUserId(userId);

    return deletedTrainerProfile;
  }

  async addNotAvailableDays(userId: number, datesArray: string[]) {
    let theTrainerProfile = await this.trainerProfileModel.getByUserId(userId);
    return await this.trainerProfileModel.insertNotAvailableDays(
      theTrainerProfile.id,
      datesArray,
    );
  }
}
