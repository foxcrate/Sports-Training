import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PackageCreateDto } from './dtos/package-create.dto';
import { PackageReturnDto } from './dtos/package-return.dto';
import { PackageRepository } from './package.repository';
import { TrainerProfileRepository } from 'src/trainer-profile/trainer-profile.repository';
import moment from 'moment-timezone';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class PackageService {
  constructor(
    private readonly i18n: I18nService,
    private packageRepository: PackageRepository,
    private trainerProfileRepository: TrainerProfileRepository,
  ) {}

  async create(reqBody: PackageCreateDto, userId: number): Promise<PackageReturnDto> {
    let trainerProfile = await this.trainerProfileRepository.getByUserId(userId);
    // validate package schedule

    reqBody.sessionsDateTime = reqBody.sessionsDateTime.map((item) => {
      return moment(item).toISOString();
    });

    return await this.packageRepository.create(reqBody, trainerProfile.id);
  }

  async GetOne(packageId: number, userId: number): Promise<PackageReturnDto> {
    await this.authorizeResource(packageId, userId);
    return await this.packageRepository.getOneById(packageId);
  }

  private async authorizeResource(packageId: number, userId: number): Promise<any> {
    //get pacakge
    let thePackage = await this.packageRepository.getOneById(packageId);
    if (!thePackage) {
      throw new NotFoundException(
        this.i18n.t(`errors.RECORD_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
    }

    let currentUserTrainerProfile =
      await this.trainerProfileRepository.getByUserId(userId);
    if (thePackage.trainerProfileId != currentUserTrainerProfile.id) {
      throw new ForbiddenException(
        this.i18n.t(`errors.NOT_ALLOWED`, { lang: I18nContext.current().lang }),
      );
    }
    return true;
  }
}
