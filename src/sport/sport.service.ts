import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSportDto } from './dtos/create.dto';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { ReturnSportDto } from './dtos/return.dto';
import { SportRepository } from './sport.repository';

@Injectable()
export class SportService {
  constructor(
    private SportRepository: SportRepository,
    private readonly i18n: I18nService,
  ) {}
  async create(createData: CreateSportDto): Promise<ReturnSportDto> {
    await this.findRepeated(createData.name_en);

    let newSport = await this.SportRepository.create(createData);
    return newSport[0];
  }

  async getAll(): Promise<ReturnSportDto[]> {
    let allSports: ReturnSportDto[] = await this.SportRepository.getAll();
    return allSports;
  }

  async findRepeated(name: string): Promise<boolean> {
    let repeatedSport = await this.SportRepository.findByName(name);

    if (repeatedSport[0]) {
      throw new BadRequestException(
        this.i18n.t(`errors.REPEATED_SPORT`, { lang: I18nContext.current().lang }),
      );
    }
    return false;
  }

  async checkExistance(sportsIdsArray: number[]): Promise<boolean> {
    let foundedSports: Array<ReturnSportDto> =
      await this.SportRepository.findByIds(sportsIdsArray);

    if (foundedSports.length < sportsIdsArray.length) {
      throw new NotFoundException(
        this.i18n.t(`errors.NOT_EXISTED_SPORT`, { lang: I18nContext.current().lang }),
      );
    }
    return true;
  }
}
