import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { RegionCreateDto } from './dtos/create.dto';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { RegionReturnDto } from './dtos/return.dto';
import { RegionModel } from './region.model';

@Injectable()
export class RegionService {
  constructor(
    private regionModel: RegionModel,
    private readonly i18n: I18nService,
  ) {}
  async create(createData: RegionCreateDto): Promise<RegionReturnDto> {
    await this.findRepeated(createData.name_en);

    let newRegion = await this.regionModel.create(createData);

    return newRegion[0];
  }

  async getAll(): Promise<RegionReturnDto[]> {
    let allRegions = await this.regionModel.getAll();
    return allRegions;
  }

  async findRepeated(name): Promise<boolean> {
    //Chick existed email or phone number
    let repeatedRegion = await this.regionModel.findByName(name);

    if (repeatedRegion[0]) {
      throw new BadRequestException(
        this.i18n.t(`errors.REPEATED_REGION`, { lang: I18nContext.current().lang }),
      );
    }
    return false;
  }

  async checkExistance(regionId): Promise<boolean> {
    let foundedRegion = await this.regionModel.findById(regionId);

    if (!foundedRegion[0]) {
      throw new NotFoundException(
        this.i18n.t(`errors.NOT_EXISTED_REGION`, { lang: I18nContext.current().lang }),
      );
    }
    return true;
  }
}
