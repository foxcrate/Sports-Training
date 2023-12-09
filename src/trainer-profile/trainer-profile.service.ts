import { Injectable, NotFoundException } from '@nestjs/common';
import { TrainerProfileCreateDto } from 'src/trainer-profile/dtos/create.dto';
import { ReturnTrainerProfileDto } from './dtos/return.dto';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { TrainerProfileModel } from './trainer-profile.model';

@Injectable()
export class TrainerProfileService {
  constructor(
    private trainerProfileModel: TrainerProfileModel,
    private readonly i18n: I18nService,
  ) {}

  async getOne(userId): Promise<ReturnTrainerProfileDto> {
    let trainerProfileWithSports = await this.trainerProfileModel.getOneDetailed(userId);
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
  ): Promise<ReturnTrainerProfileDto> {
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
    ]);
    // await this.trainerProfileModel.deletePastTrainerSports(deletedTrainerProfile.id);
    // await this.trainerProfileModel.deletePastTrainerFields(deletedTrainerProfile.id);

    //delete schedule sessions

    //delete
    await this.trainerProfileModel.deleteByUserId(userId);

    return deletedTrainerProfile;
  }
}
