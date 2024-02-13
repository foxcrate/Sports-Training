import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class NotificationModel {
  constructor(private prisma: PrismaService) {}

  async getAll(userId: number): Promise<any> {
    let userNotifications = await this.prisma.$queryRaw`
    SELECT *
    FROM Notification
    WHERE userId = ${userId}
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
    usersIds: number[],
    trainerBookedSessionId: number,
    sentTo: string,
    about: string,
    type: string,
    content: string,
  ) {
    let arrayToPush = [];
    if (usersIds.length <= 0) {
      return;
    }

    for (let i = 0; i < usersIds.length; i++) {
      arrayToPush.push([sentTo, about, type, content, usersIds[i]]);
    }

    await this.prisma.$queryRaw`
    INSERT INTO Notification
    (
      sentTo,
      about,
      type,
      content,
      userId
    )
    VALUES
      ${Prisma.join(arrayToPush.map((row) => Prisma.sql`(${Prisma.join(row)})`))}
    `;
  }
}
