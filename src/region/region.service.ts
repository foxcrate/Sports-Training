import { BadRequestException, Injectable } from '@nestjs/common';
import { NewBadRequestException } from 'src/exceptions/new-bad-request.exception';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegionCreateDto } from './dtos/create.dto';
import { GlobalService } from 'src/global/global.service';

@Injectable()
export class RegionService {
  constructor(
    private prisma: PrismaService,
    private globalService: GlobalService,
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
          this.globalService.getError('en', 'REPEATED_REGION'),
        );
      }
      if (repeatedRegion[0].arName == arName) {
        // throw new NewBadRequestException('REPEATED_REGION');
        throw new BadRequestException(
          this.globalService.getError('en', 'REPEATED_REGION'),
        );
      }
    }
    return false;
  }
}
