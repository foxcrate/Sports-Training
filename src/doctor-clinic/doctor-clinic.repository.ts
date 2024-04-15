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
import moment from 'moment-timezone';

@Injectable()
export class DoctorClinicRepository {
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
          dc.profileImage,
          dc.cost,
          dc.acceptanceStatus,
          dc.doctorClinicSpecializationId,
          dc.qualifications,
          dc.regionId,
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
        dcdwbh.cost,
        dcdwbh.acceptanceStatus,
        dcdwbh.doctorClinicSpecializationId,
        dcdwbh.qualifications,
        dcdwbh.profileImage,
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
        END AS doctorClinicNotAvailableDays,
        CASE
        WHEN COUNT(dcs.id ) = 0 THEN null
        ELSE
        JSON_OBJECT(
          'id',dcs.id,
          'name', MAX(DoctorClinicSpecializationTranslation.name)
          )
        END AS doctorClinicSpecialization
      FROM DoctorClinicDetailsWithBookedHours AS dcdwbh
      LEFT JOIN
      DoctorClinicNotAvailableDays AS dcnad
      ON
      dcdwbh.id = dcnad.doctorClinicId
      LEFT JOIN
      DoctorClinicSpecialization AS dcs
      ON
      dcdwbh.doctorClinicSpecializationId = dcs.id
      LEFT JOIN DoctorClinicSpecializationTranslation
      ON DoctorClinicSpecializationTranslation.doctorClinicSpecializationId = dcs.id
      AND DoctorClinicSpecializationTranslation.language = ${I18nContext.current().lang}
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
      PicturesTable AS (
        SELECT doctorClinicId,
        CASE WHEN COUNT(id) = 0 THEN null
        ELSE
        JSON_ARRAYAGG(JSON_OBJECT(
          'id',p.id,
          'imageLink', p.imageLink
          ))
        END AS gallery
        FROM Picture as p
        WHERE doctorClinicId = ${id}
        GROUP BY doctorClinicId
      ),
      Last5Feedbacks AS (
        SELECT doctorClinicId, feedback
        FROM Rate
        WHERE doctorClinicId = ${id} && feedback IS NOT NULL
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
        SELECT dc.id, dc.name, dc.cost, dc.doctorClinicSpecializationId, dc.profileImage, dc.description, dc.qualifications, dc.regionId, dc.acceptanceStatus, dc.availableWeekDays AS availableWeekDays, dc.availableDayHours AS availableDayHours,
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
        SELECT cwbh.id, cwbh.name, cwbh.cost, cwbh.doctorClinicSpecializationId, cwbh.profileImage, cwbh.description, cwbh.qualifications, cwbh.regionId, cwbh.acceptanceStatus,
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
      SELECT cwbhaf.id, cwbhaf.name, cwbhaf.cost, cwbhaf.doctorClinicSpecializationId, cwbhaf.profileImage, cwbhaf.description,cwbhaf.qualifications, cwbhaf.regionId, cwbhaf.acceptanceStatus,
        -- AVG(rav.RatingNumber) AS RatingNumber,
        CASE WHEN AVG(rav.RatingNumber) IS NULL THEN 5
          ELSE
          ROUND(AVG(rav.RatingNumber),1)
          END 
          AS RatingNumber,
        cwbhaf.feedbacks,
        cwbhaf.availableWeekDays AS availableWeekDays,
        cwbhaf.availableDayHours AS availableDayHours,
        cwbhaf.doctorClinicBookedHours AS doctorClinicBookedHours
      FROM ClinicWithBookedHoursAndFeedbacks AS cwbhaf
      LEFT JOIN RatingAvgTable AS rav
      ON cwbhaf.id = rav.doctorClinicId
      GROUP BY cwbhaf.id
      ),
      ClinicWithBookedHoursAndFeedbacksAndAvgAndGallery AS(
        SELECT cwbhafaa.id, cwbhafaa.name, cwbhafaa.cost, cwbhafaa.doctorClinicSpecializationId, cwbhafaa.profileImage, cwbhafaa.description,cwbhafaa.qualifications, cwbhafaa.regionId, cwbhafaa.acceptanceStatus,
        cwbhafaa.RatingNumber AS RatingNumber,
        cwbhafaa.feedbacks,
        cwbhafaa.availableWeekDays AS availableWeekDays,
        cwbhafaa.availableDayHours AS availableDayHours,
        cwbhafaa.doctorClinicBookedHours AS doctorClinicBookedHours,
        ps.gallery AS gallery
      FROM ClinicWithBookedHoursAndFeedbacksAndAvg AS cwbhafaa
      LEFT JOIN PicturesTable AS ps
      ON cwbhafaa.id = ps.doctorClinicId
      GROUP BY cwbhafaa.id,ps.gallery
      )
      SELECT cwbhafaaag.id, cwbhafaaag.name, cwbhafaaag.cost, cwbhafaaag.profileImage, cwbhafaaag.description,cwbhafaaag.qualifications, cwbhafaaag.acceptanceStatus,
        cwbhafaaag.RatingNumber AS RatingNumber,
        cwbhafaaag.feedbacks,
        cwbhafaaag.availableWeekDays AS availableWeekDays,
        cwbhafaaag.availableDayHours AS availableDayHours,
        nad.doctorClinicNotAvailableDays AS doctorClinicNotAvailableDays,
        cwbhafaaag.doctorClinicBookedHours AS doctorClinicBookedHours,
        cwbhafaaag.gallery AS gallery,
        CASE 
        WHEN count(r.id) = 0 THEN null
        ELSE
        JSON_OBJECT(
          'id',r.id,
          'name', MAX(RegionTranslation.name))
        END AS region,
        CASE
        WHEN COUNT(dcs.id ) = 0 THEN null
        ELSE
        JSON_OBJECT(
          'id',dcs.id,
          'name', dcs.name
          )
        END AS doctorClinicSpecialization
      FROM ClinicWithBookedHoursAndFeedbacksAndAvgAndGallery as cwbhafaaag
      LEFT JOIN NotAvailableDays as nad
      ON nad.doctorClinicId = cwbhafaaag.id
      LEFT JOIN Region AS r ON cwbhafaaag.regionId = r.id
      LEFT JOIN RegionTranslation AS RegionTranslation ON RegionTranslation.regionId = r.id
      AND RegionTranslation.language = ${I18nContext.current().lang}
      LEFT JOIN
      DoctorClinicSpecialization AS dcs
      ON
      cwbhafaaag.doctorClinicSpecializationId = dcs.id
      GROUP BY cwbhafaaag.id, nad.doctorClinicId,cwbhafaaag.gallery
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
    PicturesTable AS (
        SELECT doctorClinicId,
        CASE WHEN COUNT(id) = 0 THEN null
        ELSE
        JSON_ARRAYAGG(JSON_OBJECT(
          'id',p.id,
          'imageLink', p.imageLink
          ))
        END AS gallery
        FROM Picture as p
        WHERE doctorClinicId = (SELECT DoctorClinicId FROM GetDoctorClinicIdCTE)
        GROUP BY doctorClinicId
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
    ),
    ClinicWithBookedHoursAndFeedbacksAndAvgAndGallery AS(
        SELECT cwbhafaa.id, cwbhafaa.name, cwbhafaa.acceptanceStatus,
        cwbhafaa.RatingNumber AS RatingNumber,
        cwbhafaa.feedbacks,
        cwbhafaa.availableWeekDays AS availableWeekDays,
        cwbhafaa.availableDayHours AS availableDayHours,
        cwbhafaa.doctorClinicBookedHours AS doctorClinicBookedHours,
        ps.gallery AS gallery
      FROM ClinicWithBookedHoursAndFeedbacksAndAvg AS cwbhafaa
      LEFT JOIN PicturesTable AS ps
      ON cwbhafaa.id = ps.doctorClinicId
      GROUP BY cwbhafaa.id,ps.gallery
      )
      SELECT cwbhafaaag.id, cwbhafaaag.name, cwbhafaaag.acceptanceStatus,
        cwbhafaaag.RatingNumber AS RatingNumber,
        cwbhafaaag.feedbacks,
        cwbhafaaag.availableWeekDays AS availableWeekDays,
        cwbhafaaag.availableDayHours AS availableDayHours,
        nad.doctorClinicNotAvailableDays AS doctorClinicNotAvailableDays,
        cwbhafaaag.doctorClinicBookedHours AS doctorClinicBookedHours,
        cwbhafaaag.gallery AS gallery
      FROM ClinicWithBookedHoursAndFeedbacksAndAvgAndGallery as cwbhafaaag
      LEFT JOIN NotAvailableDays as nad
      ON nad.doctorClinicId = cwbhafaaag.id
      GROUP BY cwbhafaaag.id, nad.doctorClinicId,cwbhafaaag.gallery
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
            doctorClinicSpecializationId,
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
          ${DoctorClinicAcceptanceStatusDto.Accepted},
          ${reqBody.regionId},
          ${reqBody.doctorClinicSpecializationId},
          ${reqBody.availableWeekDays},
          ${{ from: reqBody.startTime, to: reqBody.endTime }}
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
            doctorClinicSpecializationId,
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
          ${reqBody.doctorClinicSpecializationId},
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
            doctorClinicSpecializationId = ${reqBody.doctorClinicSpecializationId},
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

  async getUserBookedHours(userId: number, dayDate: string): Promise<string[]> {
    let userBookedHours = await this.prisma.$queryRaw`
      SELECT
      JSON_ARRAYAGG(fromDateTime) AS times
      FROM DoctorClinicsBookedHours
      WHERE userId = ${userId}
      AND DATE(fromDateTime) = ${dayDate}
    `;

    return userBookedHours[0].times;
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

  async insertDoctorClinicBookedHour(
    doctorClinicId: number,
    userId: number,
    dateTime: string,
  ) {
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
  }

  async getDoctorClinicBookedHour(
    doctorClinicId: number,
    userId: number,
    dateTime: string,
  ) {
    let formatedDateTime = moment(dateTime).format('YYYY-MM-DD HH:mm:ss');

    let bookedSession = await this.prisma.$queryRaw`
      SELECT dc.name AS doctorClinicName,
      dc.profileImage AS doctorClinicProfileImage,
      DoctorClinicSpecializationTranslation.name AS specializationName,
      dcbh.fromDateTime AS sessionStartDateTime,
      dc.cost AS sessionCost
      FROM DoctorClinicsBookedHours AS dcbh
      LEFT JOIN DoctorClinic AS dc ON dc.id = dcbh.doctorClinicId
      LEFT JOIN DoctorClinicSpecialization AS dcs ON dc.doctorClinicSpecializationId = dcs.id
      LEFT JOIN DoctorClinicSpecializationTranslation
      ON DoctorClinicSpecializationTranslation.doctorClinicSpecializationId = dcs.id
      AND DoctorClinicSpecializationTranslation.language = ${I18nContext.current().lang}
      WHERE dcbh.doctorClinicId = ${doctorClinicId}
      AND dcbh.userId = ${userId}
      AND dcbh.fromDateTime = ${formatedDateTime}
      `;

    if (!bookedSession[0]) {
      throw new NotFoundException(
        this.i18n.t(`errors.RECORD_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
    }

    let cardFormat = {
      doctorClinicName: bookedSession[0].doctorClinicName,
      doctorClinicProfileImage: bookedSession[0].doctorClinicProfileImage,
      specializationName: bookedSession[0].specializationName,
      cost: bookedSession[0].sessionCost,
      date: moment(bookedSession[0].sessionStartDateTime).format('YYYY-MM-DD'),
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
