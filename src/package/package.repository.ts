import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PackageCreateDto } from './dtos/package-create.dto';
import { PackageReturnDto } from './dtos/package-return.dto';
import moment, { MomentInput } from 'moment';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PackageRepository {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async create(
    createData: PackageCreateDto,
    trainerProfileId: number,
  ): Promise<PackageReturnDto> {
    createData.sessionsDateTime = createData.sessionsDateTime.map((item) => {
      return moment(item).toISOString();
    });

    await this.prisma.$queryRaw`
    INSERT INTO Package
      (
        name,
        description,
        numberOfSessions,
        maxAttendees,
        minAttendees,
        price,
        ExpirationDate,
        fieldId,
        trainerProfileId,
        sessionsDateTime
      )
      VALUES
    (
        ${createData.name},
        ${createData.description},
        ${createData.numberOfSessions},
        ${createData.maxAttendees},
        ${createData.minAttendees},
        ${createData.price},
        ${createData.ExpirationDate},
        ${createData.fieldId},
        ${trainerProfileId},
        ${JSON.stringify(createData.sessionsDateTime)}
    )`;

    return await this.getOneByTrainerProfileId(trainerProfileId);
  }

  async getOneById(id: number): Promise<PackageReturnDto> {
    let thePackage = await this.prisma.$queryRaw`
        SELECT *
        FROM Package
        WHERE id = ${id}
        LIMIT 1
      `;
    // console.log(thePackage[0]);

    return thePackage[0];
  }
  async getOneByTrainerProfileId(trainerProfileId: number): Promise<any> {
    let thePackage = await this.prisma.$queryRaw`
        SELECT
        Package.id,
        Package.name,
        Package.description,
        Package.numberOfSessions,
        Package.maxAttendees,
        Package.minAttendees,
        Package.price,
        Package.ExpirationDate,
        Package.fieldId,
        Package.trainerProfileId,
        JSON_EXTRACT(Package.sessionsDateTime,'$') AS sessionsDateTime
        FROM Package
        WHERE trainerProfileId = ${trainerProfileId}
        LIMIT 1
      `;
    // console.log(thePackage[0]);

    // console.log('timezone:', this.configService.getOrThrow('TZ'));

    thePackage[0].sessionsDateTime = thePackage[0].sessionsDateTime.map((item) => {
      return moment(item)
        .tz(this.configService.getOrThrow('TZ'))
        .format('YYYY-MM-DD HH:mm');
    });

    return thePackage[0];
  }
}
