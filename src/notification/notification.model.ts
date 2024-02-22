import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { NOTIFICATION_SENT_TO } from 'src/global/enums';
import { PaginationParams } from 'src/global/dtos/pagination-params.dto';

@Injectable()
export class NotificationModel {
  constructor(private prisma: PrismaService) {}

  async getAll(userId: number, paginationParams: PaginationParams): Promise<any> {
    let userNotifications = await this.prisma.$queryRaw`
    SELECT
    Notification.id,
    Notification.sentTo,
    Notification.about,
    Notification.type,
    Notification.content,
    Notification.seen,
    DATE_FORMAT(TrainerBookedSession.date,'%Y-%m-%d') AS sessionDate,
    CASE
      WHEN Notification.sentTo = ${NOTIFICATION_SENT_TO.PLAYER_PROFILE}
      THEN
      (
        SELECT
         JSON_OBJECT(
          "id",User.id,
          "firstName",User.firstName,
          "lastName",User.lastName,
          "profileImage",User.profileImage,
          "mobileNumber",User.mobileNumber
        )
        FROM User
        WHERE User.id = ( select userId from TrainerProfile where TrainerProfile.id = TrainerBookedSession.trainerProfileId )
      )
      ELSE NULL
    END AS trainerInformation,
    CASE
      WHEN Notification.sentTo = ${NOTIFICATION_SENT_TO.TRAINER_PROFILE}
      THEN
      (
        SELECT
         JSON_OBJECT(
          "id",User.id,
          "firstName",User.firstName,
          "lastName",User.lastName,
          "profileImage",User.profileImage,
          "mobileNumber",User.mobileNumber
        )
        FROM User
        WHERE id = TrainerBookedSession.userId
      )
      ELSE NULL
    END AS playerInformation,
    JSON_OBJECT(
      "id",Slot.id,
      "fromTime",Slot.fromTime,
      "toTime",Slot.toTime
    ) AS Slot
    FROM Notification
    LEFT JOIN User ON User.id = Notification.userId
    LEFT JOIN TrainerBookedSession ON TrainerBookedSession.id = Notification.trainerBookedSessionId
    LEFT JOIN Slot ON Slot.id = TrainerBookedSession.slotId
    WHERE Notification.userId = ${userId}
    LIMIT ${paginationParams.limit} OFFSET ${paginationParams.offset};
    `;

    await this.prisma.$queryRaw`
      UPDATE Notification
      SET seen = true
      WHERE userId = ${userId}
    `;

    return userNotifications;
  }

  async getNewNotificationsCount(userId: number): Promise<number> {
    let newNotificationsCount = await this.prisma.$queryRaw`
    SELECT COUNT(id) AS count
    FROM Notification
    WHERE userId = ${userId}
    AND seen = false
    `;

    return Number(newNotificationsCount[0].count);
  }

  async createOne(
    userId: number,
    trainerBookedSessionId: number,
    sentTo: string,
    about: string,
    type: string,
    content: string,
  ) {
    await this.prisma.$queryRaw`
    INSERT INTO Notification
    (
      sentTo,
      about,
      type,
      content,
      trainerBookedSessionId,
      userId
    )
    VALUES
    (
      ${sentTo},
      ${about},
      ${type},
      ${content},
      ${trainerBookedSessionId},
      ${userId}
    )
    `;
  }

  async createMany(
    usersSessionsIds: any[],
    sentTo: string,
    about: string,
    type: string,
    content: string,
  ) {
    let arrayToPush = [];
    if (usersSessionsIds.length <= 0) {
      return;
    }

    for (let i = 0; i < usersSessionsIds.length; i++) {
      arrayToPush.push([
        sentTo,
        about,
        type,
        content,
        usersSessionsIds[i].sessionId,
        usersSessionsIds[i].userId,
      ]);
    }

    await this.prisma.$queryRaw`
    INSERT INTO Notification
    (
      sentTo,
      about,
      type,
      content,
      trainerBookedSessionId,
      userId
    )
    VALUES
      ${Prisma.join(arrayToPush.map((row) => Prisma.sql`(${Prisma.join(row)})`))}
    `;
  }
}
