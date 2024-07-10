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
    // createData.sessionsDateTime = createData.sessionsDateTime.map((item) => {
    //   return moment(item).toISOString();
    // });

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

    const lastInsertedItemId: any = await this.prisma.$queryRaw`
      SELECT LAST_INSERT_ID() AS id;
    `;

    // console.log(parseInt(lastInsertedItemId[0].id));

    return await this.getOneById(parseInt(lastInsertedItemId[0].id));
  }

  async getOneById(id: number): Promise<PackageReturnDto> {
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
        JSON_EXTRACT(Package.sessionsDateTime,'$[*]') AS sessionsDateTime
        FROM Package
        WHERE id = ${id}
        LIMIT 1
      `;

    thePackage[0].sessionsDateTime = thePackage[0].sessionsDateTime.map((item) => {
      return {
        date: moment(item.date).format('YYYY-MM-DD'),
        fromTime: moment(item.fromTime)
          .tz(this.configService.getOrThrow('TZ'))
          .format('HH:mm'),
        toTime: moment(item.toTime)
          .tz(this.configService.getOrThrow('TZ'))
          .format('HH:mm'),
      };
    });

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
        JSON_EXTRACT(Package.sessionsDateTime,'$[*]') AS sessionsDateTime
        FROM Package
        WHERE trainerProfileId = ${trainerProfileId}
        LIMIT 1
      `;

    thePackage[0].sessionsDateTime = thePackage[0].sessionsDateTime.map((item) => {
      return moment(item)
        .tz(this.configService.getOrThrow('TZ'))
        .format('YYYY-MM-DD HH:mm');
    });

    return thePackage[0];
  }
}
