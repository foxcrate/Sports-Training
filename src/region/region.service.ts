import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegionCreateDto } from './dtos/create.dto';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { GlobalService } from 'src/global/global.service';
import { RegionReturnDto } from './dtos/return.dto';

@Injectable()
export class RegionService {
  constructor(
    private prisma: PrismaService,
    private globalService: GlobalService,
    private readonly i18n: I18nService,
  ) {}
  async create(createData: RegionCreateDto, userId): Promise<RegionReturnDto> {
    await this.findRepeated(createData.enName, createData.arName);

    await this.prisma.$queryRaw`
    INSERT INTO Region
      (enName,
      arName,
      updatedAt)
      VALUES
    (${createData.enName},
    ${createData.arName},
    ${this.globalService.getLocalDateTime(new Date())})`;

    let newRegion = await this.prisma.$queryRaw`
    SELECT
    *
    FROM Region
    ORDER BY createdAt DESC
    LIMIT 1`;

    return newRegion[0];
  }

  async findRepeated(enName, arName): Promise<Boolean> {
    //Chick existed email or phone number
    let repeatedRegion = await this.prisma.$queryRaw`
    SELECT *
    FROM Region
    WHERE enName = ${enName} OR arName = ${arName}
    LIMIT 1
    `;

    if (repeatedRegion[0]) {
      if (repeatedRegion[0].enName == enName) {
        throw new BadRequestException(
          this.i18n.t(`errors.REPEATED_REGION`, { lang: I18nContext.current().lang }),
        );
      }
      if (repeatedRegion[0].arName == arName) {
        throw new BadRequestException(
          this.i18n.t(`errors.REPEATED_REGION`, { lang: I18nContext.current().lang }),
        );
      }
    }
    return false;
  }
}
