import { Injectable } from '@nestjs/common';
import { PROFILE_TYPES_ENUM } from 'src/global/enums';
import { GlobalService } from 'src/global/global.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProfileModel {
  constructor(
    private prisma: PrismaService,
    private globalService: GlobalService,
  ) {}

  private generateUserProfilesSelectQuery(type: PROFILE_TYPES_ENUM) {
    let sql = `
      SELECT
        CASE WHEN COUNT(Children.childUserId) <= 0 THEN
            NULL
        ELSE
            JSON_ARRAYAGG(JSON_OBJECT(
                'childId', Children.childUserId,
                'firstName', Children.childFirstName,
                'lastName', Children.childLastName,
                'profileImage', Children.profileImage
            ))
        END AS children 
    `;
    if (type !== PROFILE_TYPES_ENUM.PLAYER) {
      sql += ` 
        , CASE WHEN PlayerProfile.id IS NOT NULL THEN
            JSON_OBJECT(
              'playerProfileId', PlayerProfile.id,
              'firstName', User.firstName,
              'lastName', User.lastName,
              'profileImage', User.profileImage
            )
        ELSE
          NULL
        END AS playerProfile 
      `;
    }
    if (type !== PROFILE_TYPES_ENUM.TRAINER) {
      sql += `
        , CASE WHEN TrainerProfile.id IS NOT NULL THEN
            JSON_OBJECT(
              'trainerProfileId', TrainerProfile.id,
              'firstName', User.firstName,
              'lastName', User.lastName,
              'profileImage', User.profileImage
            )
        ELSE
          NULL
        END AS trainerProfile
      `;
    }
    return sql;
  }

  async getUserProfiles(userId: number, type: PROFILE_TYPES_ENUM, childId: number) {
    let sql = `
      ${this.generateUserProfilesSelectQuery(type)} 
      FROM 
        User
      ${
        type !== PROFILE_TYPES_ENUM.PLAYER
          ? ' LEFT JOIN PlayerProfile ON User.id = PlayerProfile.userId '
          : ''
      }
      ${
        type !== PROFILE_TYPES_ENUM.TRAINER
          ? ' LEFT JOIN TrainerProfile ON User.id = TrainerProfile.userId '
          : ''
      }
      LEFT JOIN 
        (SELECT
          ParentsChilds.childId AS childUserId,
          ParentsChilds.parentId AS parentId,
          User.firstName AS childFirstName,
          User.lastName AS childLastName,
          User.profileImage AS profileImage
        FROM 
          ParentsChilds
        INNER JOIN 
          User ON ParentsChilds.childId = User.id) AS Children ON User.id = Children.parentId
      WHERE 
        User.id = ${userId}
    `;
    if (type === PROFILE_TYPES_ENUM.CHILD) {
      sql += ` AND Children.childUserId <> ${childId} `;
    }
    return this.prisma.$queryRaw(this.globalService.preparePrismaSql(sql));
  }
}
