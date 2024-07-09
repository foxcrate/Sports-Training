import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { PrismaService } from 'src/prisma/prisma.service';
import { FieldBookingDetailsDTO } from './dtos/fieldBookingDetails.dto';
import { ConfigService } from '@nestjs/config';
import { FieldCreateDto } from './dtos/create.dto';
import { Prisma } from '@prisma/client';
import { FieldUpdateDto } from './dtos/update.dto';
import { FieldAcceptanceStatusDto } from './dtos/field-acceptance-status.dto';
import { FieldReturnDto } from './dtos/return.dto';
import { GlobalService } from 'src/global/global.service';
import moment from 'moment-timezone';
import { FieldCardFormatDto } from './dtos/field-card-format.dto';

@Injectable()
export class FieldRepository {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private globalService: GlobalService,
    private readonly i18n: I18nService,
  ) {}

  async allFields(): Promise<FieldBookingDetailsDTO[]> {
    let allFields: FieldBookingDetailsDTO[] = await this.prisma.$queryRaw`
    WITH FieldDetailsWithBookedHours AS (
      SELECT
        f.id,
        f.name,
        f.acceptanceStatus,
        f.profileImage,
        f.regionId,
        CASE WHEN AVG(r.ratingNumber) IS NULL THEN 5
          ELSE
          ROUND(AVG(r.ratingNumber),1)
          END 
          AS RatingNumber,
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
    ),
    FieldDetailsWithBookedHoursWithRegion AS(
      SELECT 
      fdwbh.id,
      fdwbh.name,
      fdwbh.acceptanceStatus,
      fdwbh.profileImage,
      fdwbh.ratingNumber,
      CASE
      WHEN COUNT(rg.id ) = 0 THEN null
      ELSE
      JSON_ARRAYAGG(JSON_OBJECT(
        'id',rg.id,
        'name', RegionTranslation.name
        ))
      END AS region,
      fdwbh.availableWeekDays AS availableWeekDays,
      fdwbh.availableDayHours AS availableDayHours,
      fdwbh.fieldBookedHours AS fieldBookedHours
    FROM FieldDetailsWithBookedHours AS fdwbh
    LEFT JOIN Region AS rg ON fdwbh.regionId = rg.id
    LEFT JOIN RegionTranslation AS RegionTranslation ON RegionTranslation.regionId = rg.id
    AND RegionTranslation.language = ${I18nContext.current().lang}
    GROUP BY  fdwbh.id
    )
    SELECT 
      fdwbhwr.id,
      fdwbhwr.name,
      fdwbhwr.acceptanceStatus,
      fdwbhwr.profileImage,
      fdwbhwr.ratingNumber,
      fdwbhwr.region,
      fdwbhwr.availableWeekDays AS availableWeekDays,
      fdwbhwr.availableDayHours AS availableDayHours,
      fdwbhwr.fieldBookedHours AS fieldBookedHours,
      CASE
      WHEN COUNT(fnad.id ) = 0 THEN null
      ELSE
      JSON_ARRAYAGG(JSON_OBJECT(
        'id',fnad.id,
        'dayDate', fnad.dayDate
        ))
      END AS fieldNotAvailableDays
    FROM FieldDetailsWithBookedHoursWithRegion AS fdwbhwr
    LEFT JOIN
    FieldNotAvailableDays AS fnad
    ON
    fdwbhwr.id = fnad.fieldId
    GROUP BY  fdwbhwr.id
    `;

    return allFields;
  }

  async getByID(id: number): Promise<FieldBookingDetailsDTO> {
    let theField = await this.prisma.$queryRaw`
    WITH FieldDetailsWithBookedHours AS (
      SELECT
        f.id,
        f.name,
        f.profileImage,
        f.description,
        f.cost,
        CASE
        WHEN COUNT(s.id ) = 0 THEN null
        ELSE
        JSON_OBJECT(
          'id',s.id,
          'name', MAX(SportTranslation.name)
          )
        END AS sport,
        CASE
        WHEN COUNT(region.id ) = 0 THEN null
        ELSE
        JSON_OBJECT(
          'id',region.id,
          'name', MAX(RegionTranslation.name)
          )
        END AS region,
        f.acceptanceStatus,
        CASE WHEN AVG(r.ratingNumber) IS NULL THEN 5
          ELSE
          ROUND(AVG(r.ratingNumber),1)
          END 
          AS ratingNumber,
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
      LEFT JOIN
      Sport AS s ON f.sportId = s.id
      LEFT JOIN SportTranslation ON SportTranslation.sportId = s.id
        AND SportTranslation.language = ${I18nContext.current().lang}
      LEFT JOIN Region AS region ON f.regionId = region.id
      LEFT JOIN RegionTranslation AS RegionTranslation ON RegionTranslation.regionId = f.regionId
      AND RegionTranslation.language = ${I18nContext.current().lang}
      WHERE
      f.id = ${id}
      GROUP BY f.id
    ),
    TrainersProfilesIdsInField AS (
      SELECT tpf.trainerProfileId AS trainerProfileIds
      FROM TrainerProfileFields AS tpf
      where fieldId = ${id}
    ),
    TrainersTable AS (
        SELECT JSON_ARRAYAGG(JSON_OBJECT(
          'trainerProfileId',tp.id,
          'trainerFirstName', u.firstName,
          'trainerLastName', u.lastName,
          'trainerProfileImage', u.profileImage,
          'cost', tp.cost
          )) AS trainerProfile
        FROM TrainerProfile AS tp
        LEFT JOIN User AS u ON tp.userId = u.id
        WHERE tp.id IN (
          SELECT trainerProfileIds
          FROM TrainersProfilesIdsInField
        )
    )
    SELECT 
      fdwbh.id,
      fdwbh.name,
      fdwbh.profileImage,
      fdwbh.description,
      fdwbh.cost,
      ( SELECT * FROM TrainersTable ) AS trainerProfiles,
      fdwbh.sport,
      fdwbh.region,
      fdwbh.acceptanceStatus,
      fdwbh.ratingNumber,
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
        CASE WHEN AVG(r.ratingNumber) IS NULL THEN 5
          ELSE
          ROUND(AVG(r.ratingNumber),1)
          END 
          AS RatingNumber,
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
      fdwbh.ratingNumber,
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

  async getFieldBookedHour(
    fieldId: number,
    userId: number,
    dateTime: string,
  ): Promise<FieldCardFormatDto> {
    let formatedDateTime = moment(dateTime).format('YYYY-MM-DD HH:mm:ss');

    let bookedSession = await this.prisma.$queryRaw`
    WITH FieldTable AS (
      SELECT regionId, sportId
      FROM Field
      WHERE id = ${fieldId}
    ),
    FieldSportTable AS (
      SELECT
      JSON_OBJECT(
        'id',s.id,
        'name', SportTranslation.name
      ) AS sportInfo
      FROM Sport AS s
      LEFT JOIN SportTranslation ON SportTranslation.sportId = s.id
        AND SportTranslation.language = ${I18nContext.current().lang}
      WHERE s.id = ( select sportId FROM FieldTable )
    ),
    FieldRegionTable AS (
      SELECT
      JSON_OBJECT(
        'id',r.id,
        'name', RegionTranslation.name
      ) AS regionInfo
      FROM Region AS r
      LEFT JOIN RegionTranslation ON RegionTranslation.regionId = r.id
        AND RegionTranslation.language = ${I18nContext.current().lang}
      WHERE r.id = ( select regionId FROM FieldTable )
    )
      SELECT f.name AS fieldName,
      f.profileImage AS fieldProfileImage,
      fbh.fromDateTime AS sessionStartDateTime,
      (SELECT sportInfo FROM FieldSportTable) AS sport,
      (SELECT regionInfo FROM FieldRegionTable) AS region,
      f.cost AS sessionCost
      FROM FieldsBookedHours AS fbh
      LEFT JOIN Field AS f ON f.id = fbh.fieldId
      WHERE fbh.fieldId = ${fieldId}
      AND fbh.userId = ${userId}
      AND fbh.fromDateTime = ${formatedDateTime}
      `;

    if (!bookedSession[0]) {
      throw new NotFoundException(
        this.i18n.t(`errors.RECORD_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
    }

    let cardFormat = {
      fieldName: bookedSession[0].fieldName,
      fieldProfileImage: bookedSession[0].fieldProfileImage,
      cost: bookedSession[0].sessionCost,
      date: moment(bookedSession[0].sessionStartDateTime).format('YYYY-MM-DD'),
      sport: bookedSession[0].sport,
      region: bookedSession[0].region,
      startTime: moment(bookedSession[0].sessionStartDateTime)
        .tz('Europe/London')
        .format('hh:mm A'),
      endTime: moment(bookedSession[0].sessionStartDateTime)
        .add(1, 'hours')
        .tz('Europe/London')
        .format('hh:mm A'),
    };
    return cardFormat;
  }

  async getFieldDetails(
    fieldId: number,
    dayDate: string,
  ): Promise<FieldBookingDetailsDTO> {
    let theField = await this.prisma.$queryRaw`
    WITH FieldDetailsWithBookedHours AS (
      SELECT
        f.id,
        f.name,
        f.acceptanceStatus,
        CASE WHEN AVG(r.ratingNumber) IS NULL THEN 5
          ELSE
          ROUND(AVG(r.ratingNumber),1)
          END 
          AS RatingNumber,
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
      fdwbh.ratingNumber,
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

  async getManyFields(idsArray: number[]) {
    let fields = [];
    if (idsArray.length >= 1) {
      fields = await this.prisma.$queryRaw`
      SELECT id,name
      FROM Field
      WHERE id IN (${Prisma.join(idsArray)})
    `;
    }

    return fields;
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
        ${JSON.stringify(reqBody.availableWeekDays)},
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
        ${JSON.stringify(reqBody.availableWeekDays)},
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

  async deleteNotAvailableDays(fieldId: number) {
    await this.prisma.$queryRaw`
      DELETE
      FROM FieldNotAvailableDays
      WHERE fieldId = ${fieldId}
    `;
  }

  async deleteRates(fieldId: number) {
    await this.prisma.$queryRaw`
      DELETE
      FROM Rate
      WHERE fieldId = ${fieldId}
    `;
  }

  async deleteSlots(fieldId: number) {
    await this.prisma.$queryRaw`
      DELETE
      FROM Slot
      WHERE fieldId = ${fieldId}
    `;
  }
  async deleteBookedHours(fieldId: number) {
    await this.prisma.$queryRaw`
      DELETE
      FROM FieldsBookedHours
      WHERE fieldId = ${fieldId}
    `;
  }

  async deleteTrainerProfileFields(fieldId: number) {
    await this.prisma.$queryRaw`
      DELETE
      FROM TrainerProfileFields
      WHERE fieldId = ${fieldId}
    `;
  }

  async getUserBookedHours(userId: number, dayDate: string): Promise<string[]> {
    let userBookedHours = await this.prisma.$queryRaw`
      SELECT
      JSON_ARRAYAGG(fromDateTime) AS times
      FROM FieldsBookedHours
      WHERE userId = ${userId}
      AND DATE(fromDateTime) = ${dayDate}
    `;

    return userBookedHours[0].times;
  }

  async selectPendingFields(): Promise<FieldBookingDetailsDTO[]> {
    // return 'alo';

    let theFields: FieldBookingDetailsDTO[] = await this.prisma.$queryRaw`
    WITH FieldDetailsWithBookedHours AS (
      SELECT
        f.id,
        f.name,
        f.acceptanceStatus,
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
        CASE WHEN AVG(r.ratingNumber) IS NULL THEN 5
          ELSE
          ROUND(AVG(r.ratingNumber),1)
          END 
          AS RatingNumber,
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
      fdwbh.ratingNumber,
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
    if (this.globalService.checkRepeatedDates(datesArray)) {
      throw new BadRequestException(
        this.i18n.t(`errors.REPEATED_DATES`, { lang: I18nContext.current().lang }),
      );
    }

    await this.deleteNotAvailableDays(fieldId);
    if (datesArray.length == 0) {
      return await this.getByID(fieldId);
    }
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
