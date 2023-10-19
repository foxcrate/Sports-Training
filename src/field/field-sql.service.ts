import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { GlobalService } from 'src/global/global.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { FieldBookingDetailsDTO } from './dtos/fieldBookingDetails.dto';

@Injectable()
export class FieldSQLService {
  constructor(
    private prisma: PrismaService,
    private readonly i18n: I18nService,
    private globalSerice: GlobalService,
  ) {}

  async allFields(): Promise<any> {
    let allFields = await this.prisma.$queryRaw`
    SELECT
    id,
    name,
    availableWeekDays,
    availableDayHours,
    TIME_FORMAT(availableDayHours->>"$.to", '%H:%i:%s') AS testTime,
    createdAt,
    updatedAt
    FROM Field;
  `;

    return allFields;
  }

  async fieldBookingDetails(fieldId: number): Promise<FieldBookingDetailsDTO> {
    let theField = await this.prisma.$queryRaw`
    SELECT
      f.id,
      f.name,
      f.availableWeekDays AS availableWeekDays,
      f.availableDayHours AS availableDayHours,
      CASE
      WHEN COUNT(fbh.id ) = 0 THEN null
      ELSE
      JSON_ARRAYAGG( JSON_OBJECT(
        'id',fbh.id,
        'fromDateTime', fbh.fromDateTime,
        'toDateTime', fbh.toDateTime,
        'userId',fbh.userId
        ))
      END
      AS
      fieldBookedHours,
      GROUP_CONCAT(DISTINCT STR_TO_DATE(fnad.dayDate,'%Y-%m-%d') )
      AS
      fieldNotAvailableDays
      FROM Field AS f
      LEFT JOIN FieldNotAvailableDays AS fnad ON f.id = fnad.fieldId
      LEFT JOIN FieldsBookedHours AS fbh ON f.id = fbh.fieldId
      WHERE f.id = ${fieldId}
      GROUP BY f.id
    `;
    console.log(theField[0]);

    return theField[0];
  }
}
