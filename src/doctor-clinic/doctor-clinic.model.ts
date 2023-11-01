import { Injectable, NotFoundException } from '@nestjs/common';
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
    private globalSerice: GlobalService,
  ) {}

  async allDoctorClinics(): Promise<DoctorClinicBookingDetailsDTO[]> {
    let allDoctorFields: DoctorClinicBookingDetailsDTO[] = await this.prisma.$queryRaw`
      WITH Query AS (
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
        q.id,
        q.name,
        q.acceptanceStatus,
        q.availableWeekDays AS availableWeekDays,
        q.availableDayHours AS availableDayHours,
        q.doctorClinicBookedHours AS doctorClinicBookedHours,
        CASE
        WHEN COUNT(dcnad.id ) = 0 THEN null
        ELSE
        JSON_ARRAYAGG(JSON_OBJECT(
          'id',dcnad.id,
          'dayDate', dcnad.dayDate
          ))
        END AS doctorClinicNotAvailableDays
      FROM Query AS q
      LEFT JOIN
      DoctorClinicNotAvailableDays AS dcnad
      ON
      q.id = dcnad.doctorClinicId
      GROUP BY  q.id
      `;

    return allDoctorFields;
  }

  async getByID(id: number): Promise<DoctorClinicBookingDetailsDTO> {
    let DoctorClinic = await this.prisma.$queryRaw`
      WITH Query AS (
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
        dc.id = ${id}
        GROUP BY dc.id
      )
      SELECT
        q.id,
        q.name,
        q.acceptanceStatus,
        q.availableWeekDays AS availableWeekDays,
        q.availableDayHours AS availableDayHours,
        q.doctorClinicBookedHours AS doctorClinicBookedHours,
        CASE
        WHEN COUNT(dcnad.id ) = 0 THEN null
        ELSE
        JSON_ARRAYAGG(JSON_OBJECT(
          'id',dcnad.id,
          'dayDate', dcnad.dayDate
          ))
        END AS doctorClinicNotAvailableDays
      FROM Query AS q
      LEFT JOIN
      DoctorClinicNotAvailableDays AS dcnad
      ON
      q.id = dcnad.doctorClinicId
      GROUP BY  q.id
      `;

    if (!DoctorClinic[0]) {
      throw new NotFoundException(
        this.i18n.t(`errors.RECORD_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
    }

    return DoctorClinic[0];
  }

  async getByName(name: string): Promise<DoctorClinicBookingDetailsDTO> {
    let theDoctorClinic = await this.prisma.$queryRaw`
      WITH Query AS (
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
        dc.name = ${name}
        GROUP BY dc.id
      )
      SELECT
        q.id,
        q.name,
        q.acceptanceStatus,
        q.availableWeekDays AS availableWeekDays,
        q.availableDayHours AS availableDayHours,
        q.doctorClinicBookedHours AS doctorClinicBookedHours,
        CASE
        WHEN COUNT(dcnad.id ) = 0 THEN null
        ELSE
        JSON_ARRAYAGG(JSON_OBJECT(
          'id',dcnad.id,
          'dayDate', dcnad.dayDate
          ))
        END AS doctorClinicNotAvailableDays
      FROM Query AS q
      LEFT JOIN
      DoctorClinicNotAvailableDays AS dcnad
      ON
      q.id = dcnad.doctorClinicId
      GROUP BY  q.id
      `;

    return theDoctorClinic[0];
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
          ${DoctorClinicAcceptanceStatusDto.Accepted},
          ${reqBody.regionId},
          ${reqBody.availableWeekDays},
          ${{ from: reqBody.startTime, to: reqBody.endTime }},
          ${this.globalSerice.getLocalDateTime(new Date())}
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
            addedByUserId,
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
          ${reqBody.regionId},
          ${reqBody.availableWeekDays},
          ${{ from: reqBody.startTime, to: reqBody.endTime }},
          ${userId},
          ${this.globalSerice.getLocalDateTime(new Date())}
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
            availableDayHours = ${{ from: reqBody.startTime, to: reqBody.endTime }},
            updatedAt = ${this.globalSerice.getLocalDateTime(new Date())}
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

  async selectPendingDoctorClinics(): Promise<DoctorClinicBookingDetailsDTO[]> {
    let theDoctorClinic: DoctorClinicBookingDetailsDTO[] = await this.prisma.$queryRaw`
      WITH Query AS (
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
        q.id,
        q.name,
        q.acceptanceStatus,
        q.availableWeekDays AS availableWeekDays,
        q.availableDayHours AS availableDayHours,
        q.doctorClinicBookedHours AS doctorClinicBookedHours,
        CASE
        WHEN COUNT(dcnad.id ) = 0 THEN null
        ELSE
        JSON_ARRAYAGG(JSON_OBJECT(
          'id',dcnad.id,
          'dayDate', dcnad.dayDate
          ))
        END AS doctorClinicNotAvailableDays
      FROM Query AS q
      LEFT JOIN
      DoctorClinicNotAvailableDays AS dcnad
      ON
      q.id = dcnad.doctorClinicId
      GROUP BY  q.id
      `;

    return theDoctorClinic;
  }

  async setDoctorClinicAcceptanceStatue(
    doctorClinicId: number,
    newStatus: DoctorClinicAcceptanceStatusDto,
  ): Promise<Boolean> {
    let updatedDoctorClinic = await this.prisma.$queryRaw`
          UPDATE DoctorClinic
          SET
            acceptanceStatus = ${newStatus},
            updatedAt = ${this.globalSerice.getLocalDateTime(new Date())}
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
      WITH Query AS (
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
        q.id,
        q.name,
        q.acceptanceStatus,
        q.availableWeekDays AS availableWeekDays,
        q.availableDayHours AS availableDayHours,
        q.doctorClinicBookedHours AS doctorClinicBookedHours,
        CASE
        WHEN COUNT(dcnad.id ) = 0 THEN null
        ELSE
        JSON_ARRAYAGG(JSON_OBJECT(
          'id',dcnad.id,
          'dayDate', dcnad.dayDate
          ))
        END AS doctorClinicNotAvailableDays
      FROM Query AS q
      LEFT JOIN
      DoctorClinicNotAvailableDays AS dcnad
      ON
      q.id = dcnad.doctorClinicId
      AND
      DATE_FORMAT(dcnad.dayDate,'%Y-%m-%d') = ${specificDate}
      GROUP BY  q.id
      `;

    return theDoctorClinic[0];
  }

  async getDoctorFieldDetails(
    doctorClinicId: number,
    dayDate: string,
  ): Promise<DoctorClinicBookingDetailsDTO> {
    let theDoctorClinic = await this.prisma.$queryRaw`
      WITH Query AS (
        SELECT
          dc.id,
          dc.name,
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
        DoctorClinicBookedHours AS dcbh
        ON
        dc.id = dcbh.doctorClinicId
        WHERE
        dc.id = ${doctorClinicId}
        GROUP BY dc.id
      )
      SELECT
        q.id,
        q.name,
        q.availableWeekDays AS availableWeekDays,
        q.availableDayHours AS availableDayHours,
        q.doctorClinicBookedHours AS doctorClinicBookedHours,
        CASE
        WHEN COUNT(dcnad.id ) = 0 THEN null
        ELSE
        JSON_ARRAYAGG(JSON_OBJECT(
          'id',dcnad.id,
          'dayDate', dcnad.dayDate
          ))
        END AS doctorClinicNotAvailableDays
      FROM Query AS q
      LEFT JOIN
      DoctorClinicNotAvailableDays AS dcnad
      ON
      q.id = dcnad.doctorClinicId
      AND
      DATE_FORMAT(dcnad.dayDate,'%Y-%m-%d') = ${dayDate}
      GROUP BY  q.id
      `;

    if (!theDoctorClinic[0]) {
      throw new NotFoundException(
        this.i18n.t(`errors.RECORD_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
    }

    return theDoctorClinic[0];
  }

  async insertDoctorClinicBookedHour(doctorClinicId: number, userId, dateTime: string) {
    await this.prisma.$queryRaw`
      INSERT INTO DoctorClinicsBookedHours
        (fromDateTime,
          gmt,
          userId,
          doctorClinicId,
        updatedAt)
        VALUES
      (
      ${dateTime},
      ${this.config.get('GMT')},
      ${userId},
      ${doctorClinicId},
      ${this.globalSerice.getLocalDateTime(new Date())})`;

    // console.log('dateTime after insert:', this.globalSerice.getLocalDateTime(new Date()));
  }

  async insertNotAvailableDays(
    doctorClinicId: number,
    datesArray: string[],
  ): Promise<DoctorClinicBookingDetailsDTO> {
    console.log(datesArray);
    let newDatesArray = [];
    for (let i = 0; i < datesArray.length; i++) {
      newDatesArray.push([
        new Date(datesArray[i]),
        doctorClinicId,
        this.globalSerice.getLocalDateTime(new Date()),
      ]);
    }
    await this.prisma.$executeRaw`
      INSERT INTO
      DoctorClinicNotAvailableDays
      (dayDate, doctorClinicId,updatedAt)
      VALUES
      ${Prisma.join(newDatesArray.map((row) => Prisma.sql`(${Prisma.join(row)})`))}
      `;

    return await this.getByID(doctorClinicId);
  }
}
