import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSportDto } from './dtos/create.dto';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class SportService {
  constructor(
    private prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}
  async create(createData: CreateSportDto, userId): Promise<any> {
    await this.findRepeated(createData.enName, createData.arName);

    await this.prisma.$queryRaw`
      INSERT INTO Sport
        (enName,
        arName,
        updatedAt)
        VALUES
      (${createData.enName},
      ${createData.arName},
      ${new Date()})`;

    let newRegion = await this.prisma.$queryRaw`
      SELECT *
      FROM Sport
      ORDER BY createdAt DESC
      LIMIT 1`;
    return newRegion;
  }

  async findRepeated(enName, arName): Promise<Boolean> {
    //Chick existed email or phone number
    let repeatedRegion = await this.prisma.$queryRaw`
    SELECT *
      FROM Sport
      WHERE enName = ${enName} OR arName = ${arName}
      LIMIT 1
      `;

    if (repeatedRegion[0]) {
      if (repeatedRegion[0].enName == enName) {
        throw new BadRequestException(
          this.i18n.t(`errors.REPEATED_SPORT`, { lang: I18nContext.current().lang }),
        );
      }
      if (repeatedRegion[0].arName == arName) {
        throw new BadRequestException(
          this.i18n.t(`errors.REPEATED_SPORT`, { lang: I18nContext.current().lang }),
        );
      }
    }
    return false;
  }
}
