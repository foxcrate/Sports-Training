import { Injectable, NotFoundException } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { GlobalService } from 'src/global/global.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { FieldBookingDetailsDTO } from './dtos/fieldBookingDetails.dto';
import { ConfigService } from '@nestjs/config';
import { FieldCreateDto } from './dtos/create';

@Injectable()
export class FieldSQLService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
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
    createdAt
    -- updatedAt
    FROM Field;
  `;

    return allFields;
  }

  async getByID(id: number): Promise<FieldBookingDetailsDTO> {
    let theField = await this.prisma.$queryRaw`
    WITH Query AS (
      SELECT
        f.id,
        f.name,
        f.availableWeekDays AS availableWeekDays,
        f.availableDayHours AS availableDayHours,
        CASE
        WHEN COUNT(fbh.id ) = 0 THEN null
        ELSE
        JSON_ARRAYAGG(JSON_OBJECT(
          'id',fbh.id,
          'fromDateTime', fbh.fromDateTime,
          'toDateTime', fbh.toDateTime,
          'userId',fbh.userId
          ))
        END AS fieldBookedHours
      FROM Field AS f
      LEFT JOIN
      FieldsBookedHours AS fbh
      ON
      f.id = fbh.fieldId
      WHERE
      f.id = ${id}
      GROUP BY f.id
    )
    SELECT 
      q.id,
      q.name,
      q.availableWeekDays AS availableWeekDays,
      q.availableDayHours AS availableDayHours,
      q.fieldBookedHours AS fieldBookedHours,
      CASE
      WHEN COUNT(fnad.id ) = 0 THEN null
      ELSE
      JSON_ARRAYAGG(JSON_OBJECT(
        'id',fnad.id,
        'dayDate', fnad.dayDate
        ))
      END AS fieldNotAvailableDays
    FROM Query AS q
    LEFT JOIN
    FieldNotAvailableDays AS fnad
    ON
    q.id = fnad.fieldId
    GROUP BY  q.id
    `;

    if (!theField[0]) {
      throw new NotFoundException(
        this.i18n.t(`errors.RECORD_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
    }

    return theField[0];
  }

  async getByName(name: string): Promise<FieldBookingDetailsDTO> {
    let theField = await this.prisma.$queryRaw`
    WITH Query AS (
      SELECT
        f.id,
        f.name,
        f.availableWeekDays AS availableWeekDays,
        f.availableDayHours AS availableDayHours,
        CASE
        WHEN COUNT(fbh.id ) = 0 THEN null
        ELSE
        JSON_ARRAYAGG(JSON_OBJECT(
          'id',fbh.id,
          'fromDateTime', fbh.fromDateTime,
          'toDateTime', fbh.toDateTime,
          'userId',fbh.userId
          ))
        END AS fieldBookedHours
      FROM Field AS f
      LEFT JOIN
      FieldsBookedHours AS fbh
      ON
      f.id = fbh.fieldId
      WHERE
      f.name = ${name}
      GROUP BY f.id
    )
    SELECT 
      q.id,
      q.name,
      q.availableWeekDays AS availableWeekDays,
      q.availableDayHours AS availableDayHours,
      q.fieldBookedHours AS fieldBookedHours,
      CASE
      WHEN COUNT(fnad.id ) = 0 THEN null
      ELSE
      JSON_ARRAYAGG(JSON_OBJECT(
        'id',fnad.id,
        'dayDate', fnad.dayDate
        ))
      END AS fieldNotAvailableDays
    FROM Query AS q
    LEFT JOIN
    FieldNotAvailableDays AS fnad
    ON
    q.id = fnad.fieldId
    GROUP BY  q.id
    `;

    return theField[0];
  }

  async create(reqBody: FieldCreateDto) {
    await this.prisma.$queryRaw`
      INSERT INTO Field
        (
          name,
          description,
          cost,
          slotDuration,
          address,
          longitude,
          latitude,
          profileImage,
          sportId,
          regionId,
          availableWeekDays,
          availableDayHours,
          updatedAt
        )
        VALUES
      (
        ${reqBody.name},
        ${reqBody.description},
        ${reqBody.cost},
        ${reqBody.slotDuration},
        ${reqBody.address},
        ${reqBody.longitude},
        ${reqBody.latitude},
        ${reqBody.profileImage},
        ${reqBody.sportId},
        ${reqBody.regionId},
        ${reqBody.availableWeekDays},
        ${{ from: reqBody.startTime, to: reqBody.endTime }},
        ${this.globalSerice.getLocalDateTime(new Date())}
      )
    `;
  }

  async updateByID(id: number): Promise<FieldBookingDetailsDTO> {
    let theField = await this.prisma.$queryRaw`
    WITH Query AS (
      SELECT
        f.id,
        f.name,
        f.availableWeekDays AS availableWeekDays,
        f.availableDayHours AS availableDayHours,
        CASE
        WHEN COUNT(fbh.id ) = 0 THEN null
        ELSE
        JSON_ARRAYAGG(JSON_OBJECT(
          'id',fbh.id,
          'fromDateTime', fbh.fromDateTime,
          'toDateTime', fbh.toDateTime,
          'userId',fbh.userId
          ))
        END AS fieldBookedHours
      FROM Field AS f
      LEFT JOIN
      FieldsBookedHours AS fbh
      ON
      f.id = fbh.fieldId
      WHERE
      f.id = ${id}
      GROUP BY f.id
    )
    SELECT 
      q.id,
      q.name,
      q.availableWeekDays AS availableWeekDays,
      q.availableDayHours AS availableDayHours,
      q.fieldBookedHours AS fieldBookedHours,
      CASE
      WHEN COUNT(fnad.id ) = 0 THEN null
      ELSE
      JSON_ARRAYAGG(JSON_OBJECT(
        'id',fnad.id,
        'dayDate', fnad.dayDate
        ))
      END AS fieldNotAvailableDays
    FROM Query AS q
    LEFT JOIN
    FieldNotAvailableDays AS fnad
    ON
    q.id = fnad.fieldId
    GROUP BY  q.id
    `;

    if (!theField[0]) {
      throw new NotFoundException(
        this.i18n.t(`errors.RECORD_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
    }

    return theField[0];
  }

  async deleteByID(id: number): Promise<any> {
    await this.prisma.$queryRaw`
    DELETE
    FROM Field
    WHERE id = ${id}
  `;
  }

  async fieldBookingDetailsForSpecificDate(
    fieldId: number,
    specificDate: string,
  ): Promise<FieldBookingDetailsDTO> {
    let theField = await this.prisma.$queryRaw`
    WITH Query AS (
      SELECT
        f.id,
        f.name,
        f.availableWeekDays AS availableWeekDays,
        f.availableDayHours AS availableDayHours,
        CASE
        WHEN COUNT(fbh.id ) = 0 THEN null
        ELSE
        JSON_ARRAYAGG(JSON_OBJECT(
          'id',fbh.id,
          'fromDateTime', fbh.fromDateTime,
          'toDateTime', fbh.toDateTime,
          'userId',fbh.userId
          ))
        END AS fieldBookedHours
      FROM Field AS f
      LEFT JOIN
      FieldsBookedHours AS fbh
      ON
      f.id = fbh.fieldId
      AND
      DATE_FORMAT(fbh.fromDateTime,'%Y-%m-%d') = ${specificDate}
      WHERE
      f.id = ${fieldId}
      GROUP BY f.id
    )
    SELECT 
      q.id,
      q.name,
      q.availableWeekDays AS availableWeekDays,
      q.availableDayHours AS availableDayHours,
      q.fieldBookedHours AS fieldBookedHours,
      CASE
      WHEN COUNT(fnad.id ) = 0 THEN null
      ELSE
      JSON_ARRAYAGG(JSON_OBJECT(
        'id',fnad.id,
        'dayDate', fnad.dayDate
        ))
      END AS fieldNotAvailableDays
    FROM Query AS q
    LEFT JOIN
    FieldNotAvailableDays AS fnad
    ON
    q.id = fnad.fieldId
    AND
    DATE_FORMAT(fnad.dayDate,'%Y-%m-%d') = ${specificDate}
    GROUP BY  q.id
    `;

    return theField[0];
  }

  async getFieldDetails(
    fieldId: number,
    dayDate: string,
  ): Promise<FieldBookingDetailsDTO> {
    let theField = await this.prisma.$queryRaw`
    WITH Query AS (
      SELECT
        f.id,
        f.name,
        f.availableWeekDays AS availableWeekDays,
        f.availableDayHours AS availableDayHours,
        CASE
        WHEN COUNT(fbh.id ) = 0 THEN null
        ELSE
        JSON_ARRAYAGG(JSON_OBJECT(
          'id',fbh.id,
          'fromDateTime', fbh.fromDateTime,
          'toDateTime', fbh.toDateTime,
          'userId',fbh.userId
          ))
        END AS fieldBookedHours
      FROM Field AS f
      LEFT JOIN
      FieldsBookedHours AS fbh
      ON
      f.id = fbh.fieldId
      WHERE
      f.id = ${fieldId}
      GROUP BY f.id
    )
    SELECT 
      q.id,
      q.name,
      q.availableWeekDays AS availableWeekDays,
      q.availableDayHours AS availableDayHours,
      q.fieldBookedHours AS fieldBookedHours,
      CASE
      WHEN COUNT(fnad.id ) = 0 THEN null
      ELSE
      JSON_ARRAYAGG(JSON_OBJECT(
        'id',fnad.id,
        'dayDate', fnad.dayDate
        ))
      END AS fieldNotAvailableDays
    FROM Query AS q
    LEFT JOIN
    FieldNotAvailableDays AS fnad
    ON
    q.id = fnad.fieldId
    AND
    DATE_FORMAT(fnad.dayDate,'%Y-%m-%d') = ${dayDate}
    GROUP BY  q.id
    `;

    if (!theField[0]) {
      throw new NotFoundException(
        this.i18n.t(`errors.RECORD_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
    }

    return theField[0];
  }

  async insertFieldBookedHour(fieldId: number, userId, dateTime: string) {
    await this.prisma.$queryRaw`
    INSERT INTO FieldsBookedHours
      (fromDateTime,
        toDateTime,
        gmt,
        userId,
        fieldId,
      updatedAt)
      VALUES
    (
    ${dateTime},
    ${dateTime},
    ${this.config.get('GMT')},
    ${userId},
    ${fieldId},
    ${this.globalSerice.getLocalDateTime(new Date())})`;

    console.log('dateTime after insert:', this.globalSerice.getLocalDateTime(new Date()));
  }
}
