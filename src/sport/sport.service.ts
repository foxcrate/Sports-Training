import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSportDto } from './dtos/create.dto';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { GlobalService } from 'src/global/global.service';
import { ReturnSportDto } from './dtos/return.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SportService {
  constructor(
    private prisma: PrismaService,
    private globalService: GlobalService,
    private readonly i18n: I18nService,
  ) {}
  async create(createData: CreateSportDto, userId): Promise<ReturnSportDto> {
    await this.findRepeated(createData.name);

    await this.prisma.$queryRaw`
      INSERT INTO Sport
        (name)
        VALUES
      (${createData.name})`;

    let newRegion = await this.prisma.$queryRaw`
      SELECT *
      FROM Sport
      ORDER BY createdAt DESC
      LIMIT 1`;
    return newRegion[0];
  }

  async getAll(): Promise<ReturnSportDto[]> {
    let allSports: ReturnSportDto[] = await this.prisma.$queryRaw`
    SELECT *
    FROM Sport
      `;
    return allSports;
  }

  async findRepeated(name): Promise<boolean> {
    //Chick existed email or phone number
    let repeatedRegion = await this.prisma.$queryRaw`
    SELECT *
      FROM Sport
      WHERE name = ${name}
      LIMIT 1
      `;

    if (repeatedRegion[0]) {
      if (repeatedRegion[0].name == name) {
        throw new BadRequestException(
          this.i18n.t(`errors.REPEATED_SPORT`, { lang: I18nContext.current().lang }),
        );
      }
    }
    return false;
  }

  async checkSportsExistance(sportsArray): Promise<boolean> {
    let foundedSports: Array<ReturnSportDto> = await this.prisma.$queryRaw`
    SELECT *
    FROM Sport
    WHERE id IN (${Prisma.join(sportsArray)});
    `;

    if (foundedSports.length < sportsArray.length) {
      throw new NotFoundException(
        this.i18n.t(`errors.NOT_EXISTED_SPORT`, { lang: I18nContext.current().lang }),
      );
    }
    return true;
  }
}
