import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegionReturnDto } from './dtos/return.dto';
import { I18nContext } from 'nestjs-i18n';
import { RegionCreateDto } from './dtos/create.dto';

@Injectable()
export class RegionModel {
  constructor(private prisma: PrismaService) {}

  async getAll(): Promise<RegionReturnDto[]> {
    let allRegions: RegionReturnDto[] = await this.prisma.$queryRaw`
        SELECT
        Region.id,
        RegionTranslation.name AS name
        FROM Region
        LEFT JOIN RegionTranslation
        ON RegionTranslation.regionId = Region.id
        AND RegionTranslation.language = ${I18nContext.current().lang}
    `;

    return allRegions;
  }

  async findById(regionId: number): Promise<RegionReturnDto[]> {
    let foundedRegion: [] = await this.prisma.$queryRaw`
    SELECT *
    FROM Region
    WHERE id = ${regionId};
    `;

    return foundedRegion;
  }

  async findByName(name: string): Promise<RegionReturnDto[]> {
    let foundedRegion: [] = await this.prisma.$queryRaw`
    SELECT *
    FROM Region
    WHERE name = ${name}
    `;

    return foundedRegion;
  }

  async create(createData: RegionCreateDto): Promise<RegionReturnDto[]> {
    await this.prisma.$queryRaw`
    INSERT INTO Region
      (name)
      VALUES
    (${createData.name_en})`;

    let newRegion: RegionReturnDto[] = await this.prisma.$queryRaw`
    SELECT
    *
    FROM Region
    WHERE Region.name = ${createData.name_en}
    `;

    await this.prisma.$queryRaw`
    INSERT INTO RegionTranslation
      (
        regionId,
      language,
      name
      )
      VALUES
    (
      ${newRegion[0].id},
      'en',
      ${createData.name_en}
    ),
    (
      ${newRegion[0].id},
      'ar',
      ${createData.name_ar}
    )
    `;

    return newRegion;
  }
}
