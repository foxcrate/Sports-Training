import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GlobalModel {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private readonly i18n: I18nService,
  ) {}

  async allAgeGroups(): Promise<[]> {
    let allAgeGroups: [] = await this.prisma.$queryRaw`
        SELECT
        id,
        name
        FROM
        AgeGroup
      `;

    return allAgeGroups;
  }

  async getOneAgeGroup(ageGroupId: number): Promise<any> {
    let allAgeGroups: any[] = await this.prisma.$queryRaw`
        SELECT
        id,
        name
        FROM
        AgeGroup
        WHERE id = ${ageGroupId}
      `;

    if (!allAgeGroups[0]) {
      throw new NotFoundException(
        this.i18n.t(`errors.AGE_GROUP_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
    }

    return allAgeGroups[0];
  }
}
