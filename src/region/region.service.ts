import { BadRequestException, Injectable } from '@nestjs/common';
import { NewBadRequestException } from 'src/exceptions/new-bad-request.exception';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegionCreateDto } from './dtos/create.dto';
import { GlobalService } from 'src/global/global.service';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class RegionService {
  constructor(
    private prisma: PrismaService,
    private globalService: GlobalService,
    private readonly i18n: I18nService,
  ) {}
  async create(createData: RegionCreateDto, userId): Promise<any> {
    await this.findRepeated(createData.enName, createData.arName);

    await this.prisma.$queryRaw`
    INSERT INTO Region
      (enName,
      arName,
      updatedAt)
      VALUES
    (${createData.enName},
    ${createData.arName},
    ${new Date()})`;

    let newRegion = await this.prisma.$queryRaw`
    SELECT *
    FROM Region
    ORDER BY createdAt DESC
    LIMIT 1`;
    return newRegion;
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
        // throw new NewBadRequestException('REPEATED_REGION');
        throw new BadRequestException(
          // this.globalService.getError('en', 'REPEATED_REGION'),
          this.i18n.t(`errors.REPEATED_REGION`, { lang: I18nContext.current().lang }),
        );
      }
      if (repeatedRegion[0].arName == arName) {
        // throw new NewBadRequestException('REPEATED_REGION');
        throw new BadRequestException(
          // this.globalService.getError('en', 'REPEATED_REGION'),
          this.i18n.t(`errors.REPEATED_REGION`, { lang: I18nContext.current().lang }),
        );
      }
    }
    return false;
  }
}
