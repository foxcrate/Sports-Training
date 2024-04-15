import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReturnUserDto } from './dtos/return.dto';
import { SignupUserDto } from './dtos/signup.dto';
import { I18nContext } from 'nestjs-i18n';
import { CompleteSignupUserDto } from './dtos/complete-signup.dto';
import { NativeUserDto } from './dtos/native.dto';
import { AvailableRoles } from 'src/auth/dtos/available-roles.dto';
import { UserMetaData } from './dtos/user-meta-data.dto';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async getChilds(userId): Promise<ReturnUserDto[]> {
    let userChilds: ReturnUserDto[] = await this.prisma.$queryRaw`
      SELECT
      u.id AS id,
      u.firstName AS firstName,
      u.lastName AS lastName,
      u.profileImage AS profileImage,
      u.email AS email,
      u.mobileNumber AS mobileNumber,
      GenderTranslation.name AS gender,
      u.birthday AS birthday
      FROM ParentsChilds AS pc
      INNER JOIN User AS u
      ON pc.childId = u.id
      AND
      u.userType = 'child'
      LEFT JOIN Gender ON u.genderId = Gender.id
      LEFT JOIN GenderTranslation
      ON GenderTranslation.genderId = Gender.id
      AND GenderTranslation.language = ${I18nContext.current().lang}
      WHERE parentId = ${userId}
    `;
    return userChilds;
  }

  async create(signupData: SignupUserDto) {
    await this.prisma.$queryRaw`
    INSERT INTO User
    (
      firstName,
      lastName,
      profileImage,
      password,
      userType,
      email,
      mobileNumber,
      genderId,
      birthday
    )
    VALUES
    (
      ${signupData.firstName},
      ${signupData.lastName},
      ${signupData.profileImage},
      ${signupData.password},
      ${AvailableRoles.User},
      ${signupData.email},
      ${signupData.mobileNumber},
      ${signupData.genderId},
      ${new Date(signupData.birthday)}
    )`;
  }

  async createByMobile(mobileNumber: string) {
    await this.prisma.$queryRaw`
    INSERT INTO User
    (
      mobileNumber,
      userType
    )
    VALUES
    (
      ${mobileNumber},
      ${AvailableRoles.User}
    )`;
  }

  async updateById(userId: number, data: CompleteSignupUserDto) {
    //complete profile
    await this.prisma.$queryRaw`
        UPDATE User
        SET
        firstName = ${data.firstName},
        lastName = ${data.lastName},
        email = ${data.email},
        profileImage = ${data.profileImage},
        birthday = ${new Date(data.birthday)}
        WHERE
        id = ${userId};
      `;
  }

  async completeSignup(userId: number, data: CompleteSignupUserDto) {
    //complete profile
    await this.prisma.$queryRaw`
        UPDATE User
        SET
        firstName = ${data.firstName},
        lastName = ${data.lastName},
        email = ${data.email},
        genderId = ${data.genderId},
        profileImage = ${data.profileImage},
        birthday = ${new Date(data.birthday)}
        WHERE
        id = ${userId};
      `;
  }

  async updatePassword(userId: number, hashedPassword: string) {
    //update//
    await this.prisma.$queryRaw`
       UPDATE User
       SET
       password = ${hashedPassword}
       WHERE
       id = ${userId};
     `;
  }

  async updateMobile(userId: number, mobileNumber: string) {
    //update
    await this.prisma.$queryRaw`
       UPDATE User
       SET
       mobileNumber = ${mobileNumber}
       WHERE
       id = ${userId};
     `;
  }

  async activateAccount(userId: number) {
    await this.prisma.$queryRaw`
       UPDATE User
       SET
       isActivated = true
       WHERE
       id = ${userId};
     `;
  }

  async isMyChild(parentId: number, childId: number): Promise<boolean> {
    let parentChild = await this.prisma.$queryRaw`
      SELECT
      id
      FROM ParentsChilds
      WHERE parentId = ${parentId}
      AND
      childId = ${childId}
      LIMIT 1
    `;
    if (!parentChild[0]) {
      return false;
    }
    return true;
  }

  async getById(userId): Promise<ReturnUserDto> {
    let theUser = await this.prisma.$queryRaw`
      SELECT
        User.id,
        firstName,
        lastName,
        profileImage,
        email,
        mobileNumber,
        GenderTranslation.name AS gender,
        birthday
      FROM User
      LEFT JOIN Gender ON User.genderId = Gender.id
      LEFT JOIN GenderTranslation
      ON GenderTranslation.genderId = Gender.id
      AND GenderTranslation.language = ${I18nContext.current().lang}
      WHERE User.id = ${userId}
      LIMIT 1
    `;
    return theUser[0];
  }

  async getByMobileNumber(mobileNumber): Promise<ReturnUserDto> {
    let theUser = await this.prisma.$queryRaw`
      SELECT
        User.id,
        firstName,
        lastName,
        profileImage,
        email,
        mobileNumber,
        GenderTranslation.name AS gender,
        birthday
      FROM User
      LEFT JOIN Gender ON User.genderId = Gender.id
      LEFT JOIN GenderTranslation
      ON GenderTranslation.genderId = Gender.id
      AND GenderTranslation.language = ${I18nContext.current().lang}
      WHERE User.mobileNumber = ${mobileNumber}
      LIMIT 1
    `;
    return theUser[0];
  }

  async getUserMetaData(userId: number): Promise<UserMetaData> {
    let userMetaData = await this.prisma.$queryRaw`
      SELECT
      User.id AS id,
      User.userType AS userType,
      CASE WHEN PlayerProfile.id = 0 THEN null
      ELSE
      PlayerProfile.id
      END AS playerProfileId,
      CASE WHEN TrainerProfile.id = 0 THEN null
      ELSE
      TrainerProfile.id
      END AS trainerProfileId,
      COUNT(ParentsChilds.id) AS childrenNumber
      FROM User
      LEFT JOIN PlayerProfile ON User.id = PlayerProfile.userId
      LEFT JOIN TrainerProfile ON User.id = TrainerProfile.userId
      LEFT JOIN ParentsChilds ON User.id = ParentsChilds.parentId
      WHERE User.id = ${userId}
      GROUP BY User.id
    `;
    // console.log(userMetaData);

    userMetaData[0].childrenNumber = parseInt(userMetaData[0].childrenNumber, 16);
    return userMetaData[0];
  }

  async getNativeByMobileNumber(mobileNumber): Promise<NativeUserDto> {
    let theUser = await this.prisma.$queryRaw`
      SELECT
      *
      FROM User
      WHERE mobileNumber = ${mobileNumber}
      LIMIT 1
    `;
    return theUser[0];
  }

  async getByEmail(email): Promise<ReturnUserDto> {
    let theUser = await this.prisma.$queryRaw`
      SELECT
        User.id,
        firstName,
        lastName,
        profileImage,
        email,
        mobileNumber,
        GenderTranslation.name AS gender,
        birthday
      FROM User
      LEFT JOIN Gender ON User.genderId = Gender.id
      LEFT JOIN GenderTranslation
      ON GenderTranslation.genderId = Gender.id
      AND GenderTranslation.language = ${I18nContext.current().lang}
      WHERE User.email = ${email}
      LIMIT 1
    `;
    return theUser[0];
  }

  async getChildsIds(userId: number): Promise<number[]> {
    let idsObject: any[] = await this.prisma.$queryRaw`
      SELECT childId
      FROM ParentsChilds
      WHERE parentId = ${userId}
    `;

    // console.log({ idsObject });

    let childsIds = idsObject.map((obj) => {
      return obj.childId;
    });
    return childsIds;
  }

  async createChild(reqBody, userId) {
    await this.prisma.$queryRaw`
    INSERT INTO User
      (firstName,
      lastName,
      userType,
      profileImage,
      email,
      mobileNumber,
      genderId,
      birthday)
      VALUES
    (${reqBody.firstName},
    ${reqBody.lastName},
    ${AvailableRoles.Child},
    ${reqBody.profileImage},
    ${reqBody.email},
    ${reqBody.mobileNumber},
    ${reqBody.genderId},
    ${reqBody.birthday})`;

    let theChild = await this.getByMobileNumber(reqBody.mobileNumber);

    await this.prisma.$queryRaw`
    INSERT INTO ParentsChilds
      (parentId,
      childId)
      VALUES
    (${userId},
    ${theChild.id})`;
  }

  async deleteById(userId) {
    await this.prisma.$queryRaw`
    DELETE FROM
    User
    WHERE
    id = ${userId};`;
  }

  async deleteChildRelations(childId) {
    await this.prisma.$queryRaw`
    DELETE FROM
    ParentsChilds
    WHERE
    childId = ${childId};`;
  }
}
