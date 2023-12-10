import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { GlobalService } from 'src/global/global.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { DoctorClinicBookingDetailsDTO } from './dtos/doctorClinicBookingDetails.dto';
import { DoctorClinicReturnDto } from './dtos/return.dto';
import { DoctorClinicCreateDto } from './dtos/create.dto';
import { Prisma } from '@prisma/client';
import { DoctorClinicAcceptanceStatusDto } from './dtos/doctor-clinic-acceptance-status.dto';
import { DoctorClinicUpdateDto } from './dtos/update.dto';

@Injectable()
export class DoctorClinicModel {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private readonly i18n: I18nService,
    private globalService: GlobalService,
  ) {}

  async allDoctorClinics(): Promise<DoctorClinicBookingDetailsDTO[]> {
    let allDoctorFields: DoctorClinicBookingDetailsDTO[] = await this.prisma.$queryRaw`
      WITH DoctorClinicDetailsWithBookedHours AS (
        SELECT
          dc.id,
          dc.name,
          dc.acceptanceStatus,
          dc.availableWeekDays AS availableWeekDays,
          dc.availableDayHours AS availableDayHours,
          CASE
          WHEN COUNT(dcbh.id ) = 0 THEN null
          ELSE
          JSON_ARRAYAGG(JSON_OBJECT(
            'id',dcbh.id,
            'fromDateTime', dcbh.fromDateTime,
            'userId',dcbh.userId
            ))
          END AS doctorClinicBookedHours
        FROM DoctorClinic AS dc
        LEFT JOIN
        DoctorClinicsBookedHours AS dcbh
        ON
        dc.id = dcbh.doctorClinicId
        WHERE
        dc.acceptanceStatus = 'accepted'
        GROUP BY dc.id
      )
      SELECT
        dcdwbh.id,
        dcdwbh.name,
        dcdwbh.acceptanceStatus,
        -- each clinic average
        (
          SELECT
          AVG(ratingNumber)
          FROM Rate
          WHERE
          doctorClinicId = dcdwbh.id
        ) AS Rate,
        -- each clinic 5 feedbacks
        (
          SELECT
          JSON_ARRAYAGG(feedback)
          FROM Rate
          WHERE
          doctorClinicId = dcdwbh.id
          LIMIT 5
        ) AS Feedbacks,
        dcdwbh.availableWeekDays AS availableWeekDays,
        dcdwbh.availableDayHours AS availableDayHours,
        dcdwbh.doctorClinicBookedHours AS doctorClinicBookedHours,
        CASE
        WHEN COUNT(dcnad.id ) = 0 THEN null
        ELSE
        JSON_ARRAYAGG(JSON_OBJECT(
          'id',dcnad.id,
          'dayDate', dcnad.dayDate
          ))
        END AS doctorClinicNotAvailableDays
      FROM DoctorClinicDetailsWithBookedHours AS dcdwbh
      LEFT JOIN
      DoctorClinicNotAvailableDays AS dcnad
      ON
      dcdwbh.id = dcnad.doctorClinicId
      GROUP BY  dcdwbh.id
      `;

    return allDoctorFields;
  }

  async getByID(id: number): Promise<DoctorClinicBookingDetailsDTO> {
    let DoctorClinic = await this.prisma.$queryRaw`
      WITH
      RatingAvgTable AS (
        SELECT doctorClinicId,ratingNumber AS RatingNumber
        FROM Rate
        WHERE doctorClinicId = ${id}
      ),
      Last5Feedbacks AS (
        SELECT doctorClinicId, feedback
        FROM Rate
        WHERE doctorClinicId = ${id}
        LIMIT 5
      ),
      NotAvailableDays AS (
        SELECT doctorClinicId,
        CASE WHEN COUNT(nad.id ) = 0 THEN null
        ELSE
        JSON_ARRAYAGG(JSON_OBJECT(
          'id',nad.id,
          'dayDate', nad.dayDate
          ))
        END AS doctorClinicNotAvailableDays
        FROM DoctorClinicNotAvailableDays as nad
        WHERE doctorClinicId = ${id}
        GROUP BY doctorClinicId
      ),
      ClinicWithBookedHours AS (
        SELECT dc.id, dc.name, dc.acceptanceStatus, dc.availableWeekDays AS availableWeekDays, dc.availableDayHours AS availableDayHours,
        CASE WHEN COUNT(dcbh.id ) = 0 THEN null
        ELSE
        JSON_ARRAYAGG(JSON_OBJECT(
          'id',dcbh.id,
          'fromDateTime', dcbh.fromDateTime,
          'userId',dcbh.userId
          ))
        END AS doctorClinicBookedHours
        FROM DoctorClinic AS dc
        LEFT JOIN DoctorClinicsBookedHours AS dcbh
        ON dc.id = dcbh.doctorClinicId
        WHERE dc.id = ${id}
        GROUP BY dc.id
      ),
      ClinicWithBookedHoursAndFeedbacks AS (
        SELECT cwbh.id, cwbh.name, cwbh.acceptanceStatus,
          CASE WHEN COUNT(l5f.doctorClinicId ) = 0 THEN null
          ELSE
          JSON_ARRAYAGG(l5f.feedback)
          END AS Feedbacks,
          cwbh.availableWeekDays AS availableWeekDays,
          cwbh.availableDayHours AS availableDayHours,
          cwbh.doctorClinicBookedHours AS doctorClinicBookedHours
        FROM ClinicWithBookedHours as cwbh
        LEFT JOIN Last5Feedbacks as l5f
        ON
        l5f.doctorClinicId = cwbh.id
        GROUP BY cwbh.id
      ),
      ClinicWithBookedHoursAndFeedbacksAndAvg AS(
      SELECT cwbhaf.id, cwbhaf.name, cwbhaf.acceptanceStatus,
        AVG(rav.RatingNumber) AS RatingNumber,
        cwbhaf.feedbacks,
        cwbhaf.availableWeekDays AS availableWeekDays,
        cwbhaf.availableDayHours AS availableDayHours,
        cwbhaf.doctorClinicBookedHours AS doctorClinicBookedHours
      FROM ClinicWithBookedHoursAndFeedbacks AS cwbhaf
      LEFT JOIN RatingAvgTable AS rav
      ON cwbhaf.id = rav.doctorClinicId
      GROUP BY cwbhaf.id
      )
      SELECT cwbhafaa.id, cwbhafaa.name, cwbhafaa.acceptanceStatus,
        cwbhafaa.RatingNumber AS RatingNumber,
        cwbhafaa.feedbacks,
        cwbhafaa.availableWeekDays AS availableWeekDays,
        cwbhafaa.availableDayHours AS availableDayHours,
        nad.doctorClinicNotAvailableDays AS DoctorClinicNotAvailableDays,
        cwbhafaa.doctorClinicBookedHours AS doctorClinicBookedHours
      FROM ClinicWithBookedHoursAndFeedbacksAndAvg as cwbhafaa
      LEFT JOIN NotAvailableDays as nad
      ON nad.doctorClinicId = cwbhafaa.id
      GROUP BY cwbhafaa.id,nad.doctorClinicId
      `;

    if (!DoctorClinic[0]) {
      throw new NotFoundException(
        this.i18n.t(`errors.RECORD_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
    }

    return DoctorClinic[0];
  }

  async getByName(name: string): Promise<DoctorClinicBookingDetailsDTO> {
    let DoctorClinic = await this.prisma.$queryRaw`
    WITH 
    GetDoctorClinicIdCTE AS (
      SELECT id AS DoctorClinicId
      FROM DoctorClinic
      WHERE name = ${name}
      LIMIT 1
    ),
    RatingAvgTable AS (
      SELECT doctorClinicId,r.ratingNumber AS RatingNumber
      FROM Rate as r
      WHERE doctorClinicId = (SELECT DoctorClinicId FROM GetDoctorClinicIdCTE)
    ),
  Last5Feedbacks AS (
      SELECT doctorClinicId,feedback
      FROM Rate
      WHERE doctorClinicId = (SELECT DoctorClinicId FROM GetDoctorClinicIdCTE)
      LIMIT 5
    ),
    NotAvailableDays AS (
      SELECT doctorClinicId,
      CASE WHEN COUNT(nad.id ) = 0 THEN null
      ELSE
      JSON_ARRAYAGG(JSON_OBJECT(
        'id',nad.id,
        'dayDate', nad.dayDate
        ))
      END AS doctorClinicNotAvailableDays
      FROM
      DoctorClinicNotAvailableDays as nad
      WHERE doctorClinicId = (SELECT DoctorClinicId FROM GetDoctorClinicIdCTE)
      GROUP BY doctorClinicId
    ),
  ClinicWithBookedHours AS (
    SELECT dc.id, dc.name, dc.acceptanceStatus,
      dc.availableWeekDays AS availableWeekDays,
      dc.availableDayHours AS availableDayHours,
      CASE
      WHEN COUNT(dcbh.id ) = 0 THEN null
      ELSE
      JSON_ARRAYAGG(JSON_OBJECT(
        'id',dcbh.id,
        'fromDateTime', dcbh.fromDateTime,
        'userId',dcbh.userId
        ))
      END AS doctorClinicBookedHours
    FROM DoctorClinic AS dc
    LEFT JOIN DoctorClinicsBookedHours AS dcbh
    ON dc.id = dcbh.doctorClinicId
    WHERE dc.id = (SELECT DoctorClinicId FROM GetDoctorClinicIdCTE)
    GROUP BY dc.id
    ),
    ClinicWithBookedHoursAndFeedbacks AS (
    SELECT cwbh.id, cwbh.name, cwbh.acceptanceStatus,
      CASE WHEN COUNT(l5f.doctorClinicId ) = 0 THEN null
      ELSE
      JSON_ARRAYAGG(l5f.feedback)
      END AS Feedbacks,
      cwbh.availableWeekDays AS availableWeekDays,
      cwbh.availableDayHours AS availableDayHours,
      cwbh.doctorClinicBookedHours AS doctorClinicBookedHours
    FROM ClinicWithBookedHours as cwbh
    LEFT JOIN Last5Feedbacks as l5f
    ON l5f.doctorClinicId = cwbh.id
    GROUP BY cwbh.id
    ),
    ClinicWithBookedHoursAndFeedbacksAndAvg AS(
    SELECT cwbhaf.id, cwbhaf.name, cwbhaf.acceptanceStatus,
      AVG(rav.RatingNumber) AS RatingNumber,
      cwbhaf.feedbacks,
      cwbhaf.availableWeekDays AS availableWeekDays,
      cwbhaf.availableDayHours AS availableDayHours,
      cwbhaf.doctorClinicBookedHours AS doctorClinicBookedHours
    FROM ClinicWithBookedHoursAndFeedbacks as cwbhaf
    LEFT JOIN RatingAvgTable as rav
    ON cwbhaf.id = rav.doctorClinicId
    GROUP BY cwbhaf.id
    )
    SELECT cwbhafaa.id, cwbhafaa.name, cwbhafaa.acceptanceStatus,
      cwbhafaa.RatingNumber AS RatingNumber,
      cwbhafaa.feedbacks,
      cwbhafaa.availableWeekDays AS availableWeekDays,
      cwbhafaa.availableDayHours AS availableDayHours,
      nad.doctorClinicNotAvailableDays AS DoctorClinicNotAvailableDays,
      cwbhafaa.doctorClinicBookedHours AS doctorClinicBookedHours
    FROM ClinicWithBookedHoursAndFeedbacksAndAvg as cwbhafaa
    LEFT JOIN NotAvailableDays as nad
    ON nad.doctorClinicId = cwbhafaa.id
    GROUP BY cwbhafaa.id,nad.doctorClinicId
    `;

    return DoctorClinic[0];
  }

  async create(reqBody: DoctorClinicCreateDto): Promise<DoctorClinicReturnDto> {
    let createdDoctorClinic: DoctorClinicReturnDto[] = await this.prisma.$transaction(
      [
        this.prisma.$queryRaw`
          INSERT INTO DoctorClinic
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
            regionId,
            availableWeekDays,
            availableDayHours,
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
          ${DoctorClinicAcceptanceStatusDto.Accepted},
          ${reqBody.regionId},
          ${reqBody.availableWeekDays},
          ${{ from: reqBody.startTime, to: reqBody.endTime }},
        );`,
        this.prisma.$queryRaw`
          SELECT
            *
          FROM DoctorClinic
          WHERE
          id = LAST_INSERT_ID()
          `,
      ],
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      },
    );
    return createdDoctorClinic[1];
  }

  async createByUser(
    userId: number,
    reqBody: DoctorClinicCreateDto,
  ): Promise<DoctorClinicReturnDto> {
    let createdDoctorClinic: DoctorClinicReturnDto[] = await this.prisma.$transaction(
      [
        this.prisma.$queryRaw`
          INSERT INTO DoctorClinic
          (
            name,
            description,
            cost,
            slotDuration,
            address,
            longitude,
            latitude,
            profileImage,
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
          ${reqBody.regionId},
          ${reqBody.availableWeekDays},
          ${{ from: reqBody.startTime, to: reqBody.endTime }},
          ${userId}
        );`,
        this.prisma.$queryRaw`
          SELECT
            *
          FROM DoctorClinic
          WHERE
          id = LAST_INSERT_ID()
          `,
      ],
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      },
    );
    return createdDoctorClinic[1];
  }

  async update(
    id: number,
    reqBody: DoctorClinicUpdateDto,
  ): Promise<DoctorClinicReturnDto> {
    let updatedDoctorClinic: DoctorClinicReturnDto[] = await this.prisma.$transaction(
      [
        this.prisma.$queryRaw`
          UPDATE DoctorClinic
          SET
            name = ${reqBody.name},
            description = ${reqBody.description},
            cost = ${reqBody.cost},
            slotDuration = ${reqBody.slotDuration},
            address = ${reqBody.address},
            longitude = ${reqBody.longitude},
            latitude = ${reqBody.latitude},
            profileImage = ${reqBody.profileImage},
            regionId = ${reqBody.regionId},
            availableWeekDays = ${reqBody.availableWeekDays},
            availableDayHours = ${{ from: reqBody.startTime, to: reqBody.endTime }}
          WHERE
          id = ${id};
          `,
        this.prisma.$queryRaw`
          SELECT
            *
          FROM DoctorClinic
          WHERE
          id = ${id};
          `,
      ],
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      },
    );
    return updatedDoctorClinic[1];
  }

  async deleteByID(id: number) {
    await this.prisma.$queryRaw`
      DELETE
      FROM DoctorClinic
      WHERE id = ${id}
    `;
  }

  async deleteNotAvailableDays(doctorClinicId: number) {
    await this.prisma.$queryRaw`
      DELETE
      FROM DoctorClinicNotAvailableDays
      WHERE doctorClinicId = ${doctorClinicId}
    `;
  }

  async deleteRates(doctorClinicId: number) {
    await this.prisma.$queryRaw`
      DELETE
      FROM Rate
      WHERE doctorClinicId = ${doctorClinicId}
    `;
  }

  async deleteBookedHours(doctorClinicId: number) {
    await this.prisma.$queryRaw`
      DELETE
      FROM DoctorClinicsBookedHours
      WHERE doctorClinicId = ${doctorClinicId}
    `;
  }

  async selectPendingDoctorClinics(): Promise<DoctorClinicBookingDetailsDTO[]> {
    let theDoctorClinic: DoctorClinicBookingDetailsDTO[] = await this.prisma.$queryRaw`
      WITH DoctorClinicDetailsWithBookedHours AS (
        SELECT
          dc.id,
          dc.name,
          dc.acceptanceStatus,
          dc.availableWeekDays AS availableWeekDays,
          dc.availableDayHours AS availableDayHours,
          CASE
          WHEN COUNT(dcbh.id ) = 0 THEN null
          ELSE
          JSON_ARRAYAGG(JSON_OBJECT(
            'id',dcbh.id,
            'fromDateTime', dcbh.fromDateTime,
            'userId',dcbh.userId
            ))
          END AS doctorClinicBookedHours
        FROM DoctorClinic AS dc
        LEFT JOIN
        DoctorClinicsBookedHours AS dcbh
        ON
        dc.id = dcbh.doctorClinicId
        WHERE
        dc.acceptanceStatus = 'pending'
        GROUP BY dc.id
      )
      SELECT
        dcdwbh.id,
        dcdwbh.name,
        dcdwbh.acceptanceStatus,
        dcdwbh.availableWeekDays AS availableWeekDays,
        dcdwbh.availableDayHours AS availableDayHours,
        dcdwbh.doctorClinicBookedHours AS doctorClinicBookedHours,
        CASE
        WHEN COUNT(dcnad.id ) = 0 THEN null
        ELSE
        JSON_ARRAYAGG(JSON_OBJECT(
          'id',dcnad.id,
          'dayDate', dcnad.dayDate
          ))
        END AS doctorClinicNotAvailableDays
      FROM DoctorClinicDetailsWithBookedHours AS dcdwbh
      LEFT JOIN
      DoctorClinicNotAvailableDays AS dcnad
      ON
      dcdwbh.id = dcnad.doctorClinicId
      GROUP BY  dcdwbh.id
      `;

    return theDoctorClinic;
  }

  async setDoctorClinicAcceptanceStatue(
    doctorClinicId: number,
    newStatus: DoctorClinicAcceptanceStatusDto,
  ): Promise<boolean> {
    let updatedDoctorClinic = await this.prisma.$queryRaw`
          UPDATE DoctorClinic
          SET
            acceptanceStatus = ${newStatus}
          WHERE
          id = ${doctorClinicId}
          `;
    return true;
  }

  async doctorClinicBookingDetailsForSpecificDate(
    doctorClinicId: number,
    specificDate: string,
  ): Promise<DoctorClinicBookingDetailsDTO> {
    let theDoctorClinic = await this.prisma.$queryRaw`
      WITH DoctorClinicDetailsWithBookedHours AS (
        SELECT
          dc.id,
          dc.name,
          dc.acceptanceStatus,
          dc.availableWeekDays AS availableWeekDays,
          dc.availableDayHours AS availableDayHours,
          CASE
          WHEN COUNT(dcbh.id ) = 0 THEN null
          ELSE
          JSON_ARRAYAGG(JSON_OBJECT(
            'id',dcbh.id,
            'fromDateTime', dcbh.fromDateTime,
            'userId',dcbh.userId
            ))
          END AS doctorClinicBookedHours
        FROM DoctorClinic AS dc
        LEFT JOIN
        DoctorClinicsBookedHours AS dcbh
        ON
        dc.id = dcbh.doctorClinicId
        AND
        DATE_FORMAT(dcbh.fromDateTime,'%Y-%m-%d') = ${specificDate}
        WHERE
        dc.id = ${doctorClinicId}
        GROUP BY dc.id
      )
      SELECT
        dcdwbh.id,
        dcdwbh.name,
        dcdwbh.acceptanceStatus,
        dcdwbh.availableWeekDays AS availableWeekDays,
        dcdwbh.availableDayHours AS availableDayHours,
        dcdwbh.doctorClinicBookedHours AS doctorClinicBookedHours,
        CASE
        WHEN COUNT(dcnad.id ) = 0 THEN null
        ELSE
        JSON_ARRAYAGG(JSON_OBJECT(
          'id',dcnad.id,
          'dayDate', dcnad.dayDate
          ))
        END AS doctorClinicNotAvailableDays
      FROM DoctorClinicDetailsWithBookedHours AS dcdwbh
      LEFT JOIN
      DoctorClinicNotAvailableDays AS dcnad
      ON
      dcdwbh.id = dcnad.doctorClinicId
      AND
      DATE_FORMAT(dcnad.dayDate,'%Y-%m-%d') = ${specificDate}
      GROUP BY  dcdwbh.id
      `;

    return theDoctorClinic[0];
  }

  async insertDoctorClinicBookedHour(doctorClinicId: number, userId, dateTime: string) {
    await this.prisma.$queryRaw`
      INSERT INTO DoctorClinicsBookedHours
        (fromDateTime,
          gmt,
          userId,
          doctorClinicId)
        VALUES
      (
      ${dateTime},
      ${this.config.get('GMT')},
      ${userId},
      ${doctorClinicId})`;

    // console.log('dateTime after insert:', this.globalSerice.getLocalDateTime(new Date()));
  }

  async insertNotAvailableDays(
    doctorClinicId: number,
    datesArray: string[],
  ): Promise<DoctorClinicBookingDetailsDTO> {
    if (this.globalService.checkRepeatedDates(datesArray)) {
      throw new BadRequestException(
        this.i18n.t(`errors.REPEATED_DATES`, { lang: I18nContext.current().lang }),
      );
    }
    await this.deleteNotAvailableDays(doctorClinicId);
    if (datesArray.length == 0) {
      return await this.getByID(doctorClinicId);
    }
    let newDatesArray = [];
    for (let i = 0; i < datesArray.length; i++) {
      newDatesArray.push([new Date(datesArray[i]), doctorClinicId]);
    }
    await this.prisma.$executeRaw`
      INSERT INTO
      DoctorClinicNotAvailableDays
      (dayDate, doctorClinicId)
      VALUES
      ${Prisma.join(newDatesArray.map((row) => Prisma.sql`(${Prisma.join(row)})`))}
      `;

    return await this.getByID(doctorClinicId);
  }
}

// CAST(
//   CONCAT('[',
//   substring_index(group_concat(r.feedback SEPARATOR ','), ',', 3)
//   ,']')
// AS feedbacks,
