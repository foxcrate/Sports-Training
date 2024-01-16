import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserSessionDataDto } from './dto/user-session-data.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SessionsModel {
  constructor(private prisma: PrismaService) {}

  async getCoachTrainingSession(sessionId: number) {
    return this.prisma.$queryRaw`
      SELECT
        tbs.id AS coachBookedSessionId,
        tbs.userId AS userId,
        sr.status AS status,
        tp.level AS coachLevel,
        tp.userId AS coachUserId,
        tbs.date AS bookedDate,
        tbs.gmt AS gmt,
        u.firstName AS firstName,
        u.lastName AS lastName,
        u.profileImage AS profileImage,
        r.name AS region,
        CASE
          WHEN COUNT( tps.sportId ) > 0 THEN
          JSON_ARRAYAGG(s.name) ELSE NULL 
        END AS sports,
        Slot.fromTime AS fromTime,
        Slot.toTime AS toTime,
        tp.cost AS cost 
      FROM
        TrainerBookedSession tbs
        JOIN TrainerProfile tp ON tbs.trainerProfileId = tp.id
        LEFT JOIN SessionRequest sr ON tbs.id = sr.trainerBookedSessionId
        LEFT JOIN Slot ON Slot.id = tbs.slotId
        LEFT JOIN Field f ON f.id = Slot.fieldId
        LEFT JOIN Region r ON f.regionId = r.id
        LEFT JOIN TrainerProfileSports tps ON tp.id = tps.trainerProfileId
        LEFT JOIN Sport s ON tps.sportId = s.id
        LEFT JOIN User u ON tp.userId = u.id
      WHERE
        tbs.id = ${sessionId}
      GROUP BY
        tbs.id
    `;
  }

  async getCoachingSession(sessionId: number) {
    return this.prisma.$queryRaw`
      SELECT
        tbs.id AS coachBookedSessionId,
        tbs.userId AS userId,
        sr.status AS status,
        tp.level AS coachLevel,
        pp.level AS playerLevel,
        tp.userId AS coachUserId,
        tbs.date AS bookedDate,
        tbs.gmt AS gmt,
        u.firstName AS firstName,
        u.lastName AS lastName,
        u.profileImage AS profileImage,
        r.name AS region,
        CASE
          WHEN COUNT( tps.sportId ) > 0 THEN
          JSON_ARRAYAGG(s.name) ELSE NULL 
        END AS sports,
        Slot.fromTime AS fromTime,
        Slot.toTime AS toTime,
        tp.cost AS cost 
      FROM
        TrainerBookedSession tbs
        JOIN TrainerProfile tp ON tbs.trainerProfileId = tp.id
        JOIN PlayerProfile pp ON pp.userId = tbs.userId
        LEFT JOIN SessionRequest sr ON tbs.id = sr.trainerBookedSessionId
        LEFT JOIN Slot ON Slot.id = tbs.slotId
        LEFT JOIN Field f ON f.id = Slot.fieldId
        LEFT JOIN Region r ON f.regionId = r.id
        LEFT JOIN TrainerProfileSports tps ON tp.id = tps.trainerProfileId
        LEFT JOIN Sport s ON tps.sportId = s.id
        LEFT JOIN User u ON tbs.userId = u.id
      WHERE
        tbs.id = ${sessionId}
      GROUP BY
        tbs.id
    `;
  }

  async getCoachSessionData(sessionId: number) {
    return this.prisma.$queryRaw`
      SELECT
        tbs.id AS coachBookedSessionId,
        sr.id AS sessionRequestId,
        sr.status AS sessionRequestStatus,
        tbs.status AS bookedSessionStatus,
        sr.type AS sessionRequestType,
        tp.userId AS coachUserId
      FROM
        TrainerBookedSession tbs
        JOIN TrainerProfile tp ON tbs.trainerProfileId = tp.id
        LEFT JOIN SessionRequest sr ON tbs.id = sr.trainerBookedSessionId
      WHERE
        tbs.id = ${sessionId}
      GROUP BY
        tbs.id
    `;
  }

  async getUserSessionData(sessionId: number): Promise<UserSessionDataDto[]> {
    return this.prisma.$queryRaw`
      SELECT
        tbs.id AS bookedSessionId,
        sr.id AS sessionRequestId,
        sr.status AS sessionRequestStatus,
        tbs.status AS bookedSessionStatus,
        sr.type AS sessionRequestType,
        tp.defaultCancellationTime AS cancellationHours,
        tbs.date AS date,
        Slot.fromTime AS fromTime,
        Slot.toTime AS toTime,
        tbs.userId AS userId
      FROM
        TrainerBookedSession tbs
        JOIN TrainerProfile tp ON tbs.trainerProfileId = tp.id
        LEFT JOIN SessionRequest sr ON tbs.id = sr.trainerBookedSessionId
        LEFT JOIN Slot ON Slot.id = tbs.slotId
      WHERE
        tbs.id = ${sessionId}
      GROUP BY
        tbs.id
    `;
  }

  async getCancellingReasons() {
    return this.prisma.$queryRaw`
      SELECT
        *
      FROM
        CancellationReasons
    `;
  }

  async getCancellingReason(id) {
    return this.prisma.$queryRaw`
      SELECT
        *
      FROM
        CancellationReasons
      WHERE
        id = ${id}
    `;
  }

  async updateCoachSessionStatus(
    bookedSessionId,
    bookedSessionStatus,
    sessionRequestId,
    sessionRequestStatus,
    canceledBy = null,
  ) {
    return this.prisma.$transaction([
      this.prisma.$queryRaw`
            UPDATE
              SessionRequest
            SET
              status = ${sessionRequestStatus}
              ${canceledBy ? Prisma.sql`, canceledBy = ${canceledBy}` : Prisma.empty}
            WHERE
              id = ${sessionRequestId};
          `,
      this.prisma.$queryRaw`
            UPDATE TrainerBookedSession SET status = ${bookedSessionStatus} WHERE id = ${bookedSessionId};
          `,
    ]);
  }

  async updateSetReasonCoachSessionStatus(
    bookedSessionId,
    bookedSessionStatus,
    sessionRequestId,
    sessionRequestStatus,
    cancellationReasonsId,
    canceledBy,
  ) {
    return this.prisma.$transaction([
      this.prisma.$queryRaw`
          UPDATE
            SessionRequest
          SET
            status = ${sessionRequestStatus},
            cancellationReasonsId = ${cancellationReasonsId},
            canceledBy = ${canceledBy}
          WHERE
            id = ${sessionRequestId};
        `,
      this.prisma.$queryRaw`
          UPDATE TrainerBookedSession SET status = ${bookedSessionStatus} WHERE id = ${bookedSessionId};
        `,
    ]);
  }

  async getDoctorTrainingSession(sessionId: number) {
    return this.prisma.$queryRaw`
      SELECT
        dbh.id AS doctorBookedHoursId,
        dbh.userId AS userId,
        dbh.fromDateTime AS bookedDateTime,
        dbh.gmt AS gmt,
        dc.name AS name,
        dc.profileImage AS profileImage,
        r.name AS region,
        s.name AS specialization,
        dc.slotDuration AS slotDuration,
        dc.cost AS cost 
      FROM
        DoctorClinicsBookedHours dbh
        JOIN DoctorClinic dc ON dbh.doctorClinicId = dc.id
        LEFT JOIN Region r ON dc.regionId = r.id
        LEFT JOIN DoctorClinicSpecialization s ON dc.doctorClinicSpecializationId = s.id 
      WHERE
        dbh.id = ${sessionId}
      GROUP BY
        dbh.id
    `;
  }

  async getFieldTrainingSession(sessionId: number) {
    return this.prisma.$queryRaw`
      SELECT
        fbh.id AS fieldBookedHoursId,
        fbh.userId AS userId,
        fbh.fromDateTime AS bookedDateTime,
        fbh.gmt AS gmt,
        f.name AS name,
        f.profileImage AS profileImage,
        r.name AS region,
        s.name AS sport,
        f.slotDuration AS slotDuration,
        f.description AS description,
        f.cost AS cost 
      FROM
        FieldsBookedHours fbh
        JOIN Field f ON fbh.fieldId = f.id
        LEFT JOIN Region r ON f.regionId = r.id
        LEFT JOIN Sport s ON f.sportId = s.id 
      WHERE
        fbh.id = ${sessionId}
      GROUP BY
        fbh.id
    `;
  }
}
