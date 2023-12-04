import { Injectable, NotFoundException } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { GlobalService } from 'src/global/global.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { FieldBookingDetailsDTO } from './dtos/fieldBookingDetails.dto';
import { ConfigService } from '@nestjs/config';
import { FieldCreateDto } from './dtos/create.dto';
import { Prisma } from '@prisma/client';
import { FieldUpdateDto } from './dtos/update.dto';
import { FieldAcceptanceStatusDto } from './dtos/field-acceptance-status.dto';
import { FieldReturnDto } from './dtos/return.dto';

@Injectable()
export class FieldModel {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private readonly i18n: I18nService,
    private globalSerice: GlobalService,
  ) {}

  async allFields(): Promise<FieldBookingDetailsDTO[]> {
    let allFields: FieldBookingDetailsDTO[] = await this.prisma.$queryRaw`
    WITH FieldDetailsWithBookedHours AS (
      SELECT
        f.id,
        f.name,
        f.acceptanceStatus,
        AVG(r.ratingNumber) AS rate,
        f.availableWeekDays AS availableWeekDays,
        f.availableDayHours AS availableDayHours,
        CASE
        WHEN COUNT(fbh.id ) = 0 THEN null
        ELSE
        JSON_ARRAYAGG(JSON_OBJECT(
          'id',fbh.id,
          'fromDateTime', fbh.fromDateTime,
          'userId',fbh.userId
          ))
        END AS fieldBookedHours
      FROM Field AS f
      LEFT JOIN
      FieldsBookedHours AS fbh
      ON
      f.id = fbh.fieldId
      LEFT JOIN
      Rate AS r
      ON
      f.id = r.fieldId
      WHERE
      f.acceptanceStatus = 'accepted'
      GROUP BY f.id
    )
    SELECT 
      fdwbh.id,
      fdwbh.name,
      fdwbh.acceptanceStatus,
      fdwbh.rate,
      fdwbh.availableWeekDays AS availableWeekDays,
      fdwbh.availableDayHours AS availableDayHours,
      fdwbh.fieldBookedHours AS fieldBookedHours,
      CASE
      WHEN COUNT(fnad.id ) = 0 THEN null
      ELSE
      JSON_ARRAYAGG(JSON_OBJECT(
        'id',fnad.id,
        'dayDate', fnad.dayDate
        ))
      END AS fieldNotAvailableDays
    FROM FieldDetailsWithBookedHours AS fdwbh
    LEFT JOIN
    FieldNotAvailableDays AS fnad
    ON
    fdwbh.id = fnad.fieldId
    GROUP BY  fdwbh.id
    `;

    return allFields;
  }

  async getByID(id: number): Promise<FieldBookingDetailsDTO> {
    let theField = await this.prisma.$queryRaw`
    WITH FieldDetailsWithBookedHours AS (
      SELECT
        f.id,
        f.name,
        f.acceptanceStatus,
        AVG(r.ratingNumber) AS rate,
        f.availableWeekDays AS availableWeekDays,
        f.availableDayHours AS availableDayHours,
        CASE
        WHEN COUNT(fbh.id ) = 0 THEN null
        ELSE
        JSON_ARRAYAGG(JSON_OBJECT(
          'id',fbh.id,
          'fromDateTime', fbh.fromDateTime,
          'userId',fbh.userId
          ))
        END AS fieldBookedHours
      FROM Field AS f
      LEFT JOIN
      FieldsBookedHours AS fbh
      ON
      f.id = fbh.fieldId
      LEFT JOIN
      Rate AS r
      ON
      f.id = r.fieldId
      WHERE
      f.id = ${id}
      GROUP BY f.id
    )
    SELECT 
      fdwbh.id,
      fdwbh.name,
      fdwbh.acceptanceStatus,
      fdwbh.rate,
      fdwbh.availableWeekDays AS availableWeekDays,
      fdwbh.availableDayHours AS availableDayHours,
      fdwbh.fieldBookedHours AS fieldBookedHours,
      CASE
      WHEN COUNT(fnad.id ) = 0 THEN null
      ELSE
      JSON_ARRAYAGG(JSON_OBJECT(
        'id',fnad.id,
        'dayDate', fnad.dayDate
        ))
      END AS fieldNotAvailableDays
    FROM FieldDetailsWithBookedHours AS fdwbh
    LEFT JOIN
    FieldNotAvailableDays AS fnad
    ON
    fdwbh.id = fnad.fieldId
    GROUP BY  fdwbh.id
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
    WITH FieldDetailsWithBookedHours AS (
      SELECT
        f.id,
        f.name,
        f.acceptanceStatus,
        AVG(r.ratingNumber) AS rate,
        f.availableWeekDays AS availableWeekDays,
        f.availableDayHours AS availableDayHours,
        CASE
        WHEN COUNT(fbh.id ) = 0 THEN null
        ELSE
        JSON_ARRAYAGG(JSON_OBJECT(
          'id',fbh.id,
          'fromDateTime', fbh.fromDateTime,
          'userId',fbh.userId
          ))
        END AS fieldBookedHours
      FROM Field AS f
      LEFT JOIN
      FieldsBookedHours AS fbh
      ON
      f.id = fbh.fieldId
      LEFT JOIN
      Rate AS r
      ON
      f.id = r.fieldId
      WHERE
      f.name = ${name}
      GROUP BY f.id
    )
    SELECT 
      fdwbh.id,
      fdwbh.name,
      fdwbh.acceptanceStatus,
      fdwbh.rate,
      fdwbh.availableWeekDays AS availableWeekDays,
      fdwbh.availableDayHours AS availableDayHours,
      fdwbh.fieldBookedHours AS fieldBookedHours,
      CASE
      WHEN COUNT(fnad.id ) = 0 THEN null
      ELSE
      JSON_ARRAYAGG(JSON_OBJECT(
        'id',fnad.id,
        'dayDate', fnad.dayDate
        ))
      END AS fieldNotAvailableDays
    FROM FieldDetailsWithBookedHours AS fdwbh
    LEFT JOIN
    FieldNotAvailableDays AS fnad
    ON
    fdwbh.id = fnad.fieldId
    GROUP BY  fdwbh.id
    `;

    return theField[0];
  }

  async create(reqBody: FieldCreateDto): Promise<FieldReturnDto> {
    let createdField: FieldReturnDto[] = await this.prisma.$transaction(
      [
        this.prisma.$queryRaw`
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
          acceptanceStatus,
          sportId,
          regionId,
          availableWeekDays,
          availableDayHours
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
        ${FieldAcceptanceStatusDto.Accepted},
        ${reqBody.sportId},
        ${reqBody.regionId},
        ${reqBody.availableWeekDays},
        ${{ from: reqBody.startTime, to: reqBody.endTime }}
      );`,
        this.prisma.$queryRaw`
        SELECT
          *
        FROM Field
        WHERE
        id = LAST_INSERT_ID()
        `,
      ],
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      },
    );
    return createdField[1];
  }

  async createByUser(userId: number, reqBody: FieldCreateDto): Promise<FieldReturnDto> {
    //NOTE: i think a better way to handle availableWeekDays and Hours is to accept them as json objects from the body and stringify them on creation
    //this way you can enforce a certain shape and also for someone like me to know how this is shaped exactly in db
    //right now i need to ask you to know and i should not need to do that

    let createdField: FieldReturnDto[] = await this.prisma.$transaction(
      [
        this.prisma.$queryRaw`
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
          addedByUserId
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
        ${userId}
      );`,
        this.prisma.$queryRaw`
        SELECT
          *
        FROM Field
        WHERE
        id = LAST_INSERT_ID()
        `,
      ],
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      },
    );
    return createdField[1];
  }

  async update(id: number, reqBody: FieldUpdateDto): Promise<FieldReturnDto> {
    let updatedField: FieldReturnDto[] = await this.prisma.$transaction(
      [
        this.prisma.$queryRaw`
        UPDATE Field
        SET
          name = ${reqBody.name},
          description = ${reqBody.description},
          cost = ${reqBody.cost},
          slotDuration = ${reqBody.slotDuration},
          address = ${reqBody.address},
          longitude = ${reqBody.longitude},
          latitude = ${reqBody.latitude},
          profileImage = ${reqBody.profileImage},
          sportId = ${reqBody.sportId},
          regionId = ${reqBody.regionId},
          availableWeekDays = ${reqBody.availableWeekDays},
          availableDayHours = ${{ from: reqBody.startTime, to: reqBody.endTime }}
        WHERE 
        id = ${id};
        `,
        this.prisma.$queryRaw`
        SELECT
          *
        FROM Field
        WHERE
        id = ${id};
        `,
      ],
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      },
    );
    return updatedField[1];
  }

  async deleteByID(id: number) {
    await this.prisma.$queryRaw`
    DELETE
    FROM Field
    WHERE id = ${id}
  `;
  }

  async selectPendingFields(): Promise<FieldBookingDetailsDTO[]> {
    // return 'alo';

    let theFields: FieldBookingDetailsDTO[] = await this.prisma.$queryRaw`
    WITH FieldDetailsWithBookedHours AS (
      SELECT
        f.id,
        f.name,
        f.acceptanceStatus,
        AVG(r.ratingNumber) AS rate,
        f.availableWeekDays AS availableWeekDays,
        f.availableDayHours AS availableDayHours,
        CASE
        WHEN COUNT(fbh.id ) = 0 THEN null
        ELSE
        JSON_ARRAYAGG(JSON_OBJECT(
          'id',fbh.id,
          'fromDateTime', fbh.fromDateTime,
          'userId',fbh.userId
          ))
        END AS fieldBookedHours
      FROM Field AS f
      LEFT JOIN 
      FieldsBookedHours AS fbh 
      ON 
      f.id = fbh.fieldId
      WHERE
      f.acceptanceStatus = 'pending'
      GROUP BY f.id
    )
    SELECT 
      fdwbh.id,
      fdwbh.name,
      fdwbh.acceptanceStatus,
      fdwbh.rate,
      fdwbh.availableWeekDays AS availableWeekDays,
      fdwbh.availableDayHours AS availableDayHours,
      fdwbh.fieldBookedHours AS fieldBookedHours,
      CASE
      WHEN COUNT(fnad.id ) = 0 THEN null
      ELSE
      JSON_ARRAYAGG(JSON_OBJECT(
        'id',fnad.id,
        'dayDate', fnad.dayDate
        ))
      END AS fieldNotAvailableDays
    FROM FieldDetailsWithBookedHours AS fdwbh
    LEFT JOIN
    FieldNotAvailableDays AS fnad
    ON
    fdwbh.id = fnad.fieldId
    GROUP BY  fdwbh.id
    `;

    return theFields;
  }

  async setFieldAcceptanceStatue(
    fieldId: number,
    newStatus: FieldAcceptanceStatusDto,
  ): Promise<boolean> {
    let updatedField = await this.prisma.$queryRaw`
        UPDATE Field
        SET
          acceptanceStatus = ${newStatus}
        WHERE 
        id = ${fieldId}
        `;
    return true;
  }

  async fieldBookingDetailsForSpecificDate(
    fieldId: number,
    specificDate: string,
  ): Promise<FieldBookingDetailsDTO> {
    let theField = await this.prisma.$queryRaw`
    WITH FieldDetailsWithBookedHours AS (
      SELECT
        f.id,
        f.name,
        f.acceptanceStatus,
        AVG(r.ratingNumber) AS rate,
        f.availableWeekDays AS availableWeekDays,
        f.availableDayHours AS availableDayHours,
        CASE
        WHEN COUNT(fbh.id ) = 0 THEN null
        ELSE
        JSON_ARRAYAGG(JSON_OBJECT(
          'id',fbh.id,
          'fromDateTime', fbh.fromDateTime,
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
      LEFT JOIN
      Rate AS r
      ON
      f.id = r.fieldId
      WHERE
      f.id = ${fieldId}
      GROUP BY f.id
    )
    SELECT 
      fdwbh.id,
      fdwbh.name,
      fdwbh.acceptanceStatus,
      fdwbh.rate,
      fdwbh.availableWeekDays AS availableWeekDays,
      fdwbh.availableDayHours AS availableDayHours,
      fdwbh.fieldBookedHours AS fieldBookedHours,
      CASE
      WHEN COUNT(fnad.id ) = 0 THEN null
      ELSE
      JSON_ARRAYAGG(JSON_OBJECT(
        'id',fnad.id,
        'dayDate', fnad.dayDate
        ))
      END AS fieldNotAvailableDays
    FROM FieldDetailsWithBookedHours AS fdwbh
    LEFT JOIN
    FieldNotAvailableDays AS fnad
    ON
    fdwbh.id = fnad.fieldId
    AND
    DATE_FORMAT(fnad.dayDate,'%Y-%m-%d') = ${specificDate}
    GROUP BY  fdwbh.id
    `;

    return theField[0];
  }

  async getFieldDetails(
    fieldId: number,
    dayDate: string,
  ): Promise<FieldBookingDetailsDTO> {
    //NOTE: you need not to use count on line "WHEN COUNT(fbh.id ) = 0 THEN null" you can just say "WHEN fbh.id IS NULL THEN NULL"
    //this way you are not using an aggregate function on each query for no reason

    let theField = await this.prisma.$queryRaw`
    WITH FieldDetailsWithBookedHours AS (
      SELECT
        f.id,
        f.name,
        f.acceptanceStatus,
        AVG(r.ratingNumber) AS rate,
        f.availableWeekDays AS availableWeekDays,
        f.availableDayHours AS availableDayHours,
        CASE
        WHEN COUNT(fbh.id ) = 0 THEN null
        ELSE
        JSON_ARRAYAGG(JSON_OBJECT(
          'id',fbh.id,
          'fromDateTime', fbh.fromDateTime,
          'userId',fbh.userId
          ))
        END AS fieldBookedHours
      FROM Field AS f
      LEFT JOIN
      FieldsBookedHours AS fbh
      ON
      f.id = fbh.fieldId
      LEFT JOIN
      Rate AS r
      ON
      f.id = r.fieldId
      WHERE
      f.id = ${fieldId}
      GROUP BY f.id
    )
    SELECT 
      fdwbh.id,
      fdwbh.name,
      fdwbh.acceptanceStatus,
      fdwbh.rate,
      fdwbh.availableWeekDays AS availableWeekDays,
      fdwbh.availableDayHours AS availableDayHours,
      fdwbh.fieldBookedHours AS fieldBookedHours,
      CASE
      WHEN COUNT(fnad.id ) = 0 THEN null
      ELSE
      JSON_ARRAYAGG(JSON_OBJECT(
        'id',fnad.id,
        'dayDate', fnad.dayDate
        ))
      END AS fieldNotAvailableDays
    FROM FieldDetailsWithBookedHours AS fdwbh
    LEFT JOIN
    FieldNotAvailableDays AS fnad
    ON
    fdwbh.id = fnad.fieldId
    AND
    DATE_FORMAT(fnad.dayDate,'%Y-%m-%d') = ${dayDate}
    GROUP BY  fdwbh.id
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
        gmt,
        userId,
        fieldId)
      VALUES
    (
    ${dateTime},
    ${this.config.get('GMT')},
    ${userId},
    ${fieldId}
    )`;

    // console.log('dateTime after insert:', this.globalSerice.getLocalDateTime(new Date()));
  }

  async insertNotAvailableDays(
    fieldId: number,
    datesArray: string[],
  ): Promise<FieldBookingDetailsDTO> {
    console.log(datesArray);
    let newDatesArray = [];
    for (let i = 0; i < datesArray.length; i++) {
      newDatesArray.push([new Date(datesArray[i]), fieldId]);
    }
    await this.prisma.$executeRaw`
    INSERT INTO
    FieldNotAvailableDays
    (dayDate, fieldId)
    VALUES
    ${Prisma.join(newDatesArray.map((row) => Prisma.sql`(${Prisma.join(row)})`))}
    `;

    return await this.getByID(fieldId);
  }
}
