import { Injectable, NotFoundException } from '@nestjs/common';
import { TrainerProfileCreateDto } from 'src/trainer-profile/dtos/create.dto';
import { ReturnTrainerProfileDto } from './dtos/return.dto';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { TrainerProfileRepository } from './trainer-profile.repository';
import { ReturnTrainerProfileDetailsDto } from './dtos/details-return.dto';
import { TrainerScheduleRepository } from 'src/trainer-schedule/trainer-schedule.repository';
import { PACKAGE_STATUS } from 'src/global/enums';

@Injectable()
export class TrainerProfileService {
  constructor(
    private trainerProfileRepository: TrainerProfileRepository,
    private trainerScheduleRepository: TrainerScheduleRepository,

    private readonly i18n: I18nService,
  ) {}

  async getOne(userId): Promise<ReturnTrainerProfileDetailsDto> {
    let trainerProfileWithSports =
      await this.trainerProfileRepository.getOneDetailed(userId);
    if (!trainerProfileWithSports) {
      throw new NotFoundException(
        this.i18n.t(`errors.RECORD_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
    }

    return trainerProfileWithSports;
  }

  async playerGetOne(trainerProfileId: number): Promise<ReturnTrainerProfileDetailsDto> {
    let trainerProfile = await this.trainerProfileRepository.getByID(trainerProfileId);
    let trainerProfileWithSports = await this.trainerProfileRepository.getOneDetailed(
      trainerProfile.userId,
    );
    if (!trainerProfileWithSports) {
      throw new NotFoundException(
        this.i18n.t(`errors.RECORD_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
    }

    trainerProfileWithSports.packages = trainerProfileWithSports.packages.filter((p) => {
      if (p.status == PACKAGE_STATUS.PENDING) {
        return p;
      }
    });

    return trainerProfileWithSports;
  }

  async create(
    createData: TrainerProfileCreateDto,
    userId,
  ): Promise<ReturnTrainerProfileDetailsDto> {
    // console.log(createData);
    // return createData;

    await this.trainerProfileRepository.findRepeated(userId);

    return await this.trainerProfileRepository.create(createData, userId);
  }

  async update(
    createData: TrainerProfileCreateDto,
    userId,
  ): Promise<ReturnTrainerProfileDetailsDto> {
    //check profile existence
    let trainerProfile = await this.trainerProfileRepository.getByUserId(userId);
    if (!trainerProfile) {
      throw new NotFoundException(
        this.i18n.t(`errors.RECORD_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
    }

    let updatedPlayerProfile = await this.trainerProfileRepository.update(
      createData,
      userId,
    );

    return updatedPlayerProfile;
  }

  async delete(userId): Promise<ReturnTrainerProfileDto> {
    //get deleted playerProfile
    let deletedTrainerProfile = await this.trainerProfileRepository.getByUserId(userId);

    if (!deletedTrainerProfile) {
      throw new NotFoundException(
        this.i18n.t(`errors.RECORD_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
    }

    //delete playerProfileSports
    Promise.all([
      await this.trainerProfileRepository.deletePastTrainerSports(
        deletedTrainerProfile.id,
      ),
      await this.trainerProfileRepository.deletePastTrainerFields(
        deletedTrainerProfile.id,
      ),
      await this.trainerProfileRepository.deletePastTrainerImages(
        deletedTrainerProfile.id,
      ),
      await this.trainerProfileRepository.deletePastTrainerCertificates(
        deletedTrainerProfile.id,
      ),
      await this.trainerProfileRepository.deletePastNotAvailableDays(
        deletedTrainerProfile.id,
      ),
      await this.trainerProfileRepository.deletePastBookedSessions(
        deletedTrainerProfile.id,
      ),
      await this.trainerScheduleRepository.deleteByTrainerProfileId(
        deletedTrainerProfile.id,
      ),
    ]);
    // await this.trainerProfileRepository.deletePastTrainerSports(deletedTrainerProfile.id);
    // await this.trainerProfileRepository.deletePastTrainerFields(deletedTrainerProfile.id);

    //delete schedule sessions

    //delete
    await this.trainerProfileRepository.deleteByUserId(userId);

    return deletedTrainerProfile;
  }

  async addNotAvailableDays(userId: number, datesArray: string[]) {
    let theTrainerProfile = await this.trainerProfileRepository.getByUserId(userId);
    return await this.trainerProfileRepository.insertNotAvailableDays(
      theTrainerProfile.id,
      datesArray,
    );
  }
}
