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
    await this.findRepeated(createData.name);

    await this.prisma.$queryRaw`
    INSERT INTO Region
      (name,
      updatedAt)
      VALUES
    (${createData.name},
    ${this.globalService.getLocalDateTime(new Date())})`;

    let newRegion = await this.prisma.$queryRaw`
    SELECT
    *
    FROM Region
    ORDER BY createdAt DESC
    LIMIT 1`;

    return newRegion[0];
  }

  async findRepeated(name): Promise<Boolean> {
    //Chick existed email or phone number
    let repeatedRegion = await this.prisma.$queryRaw`
    SELECT *
    FROM Region
    WHERE name = ${name}
    LIMIT 1
    `;

    if (repeatedRegion[0]) {
      if (repeatedRegion[0].name == name) {
        throw new BadRequestException(
          this.i18n.t(`errors.REPEATED_REGION`, { lang: I18nContext.current().lang }),
        );
      }
    }
    return false;
  }
}
