import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReturnUserDto } from './dtos/return.dto';
import { SignupUserDto } from './dtos/signup.dto';
import { I18nContext } from 'nestjs-i18n';
import { CompleteSignupUserDto } from './dtos/complete-signup.dto';
import { AvailableRoles } from 'src/auth/dtos/available-roles.dto';
import { UserMetaData } from './dtos/user-meta-data.dto';
import { FIND_BY } from './user-enums';

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

  async create(data: Partial<SignupUserDto>): Promise<void> {
    const { columns, values } = this.buildInsertQueryColumns(data);

    const query = `
    INSERT INTO User (${columns.join(', ')})
    VALUES (${values.map(() => '?').join(', ')});
  `;

    await this.prisma.$queryRawUnsafe(query, ...values);
  }

  async getAll(): Promise<ReturnUserDto[]> {
    return await this.prisma.$queryRaw`
    SELECT
      id,
      firstName,
      lastName,
      isActivated,
      password,
      email,
      mobileNumber,
      userType,
      genderId,
      birthday,
      createdAt,
      isPhoneVerified
    FROM
    User
    `;
  }

  async updateById(userId: number, data: CompleteSignupUserDto) {
    //complete profile
    await this.prisma.$queryRaw`
        UPDATE User
        SET
        firstName = IFNULL(${data.firstName},firstName),
        lastName = IFNULL(${data.lastName},lastName),
        password = IFNULL(${data.password},password),
        mobileNumber = IFNULL(${data.mobileNumber},mobileNumber),
        email = IFNULL(${data.email},email),
        profileImage = IFNULL(${data.profileImage},profileImage),
        birthday = IFNULL(${data.birthday},birthday)
        WHERE
        id = ${userId};
      `;
  }
  // birthday = ${new Date(data.birthday)}

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

  async findBy(
    whereColumn: FIND_BY,
    whereColumnValue: any,
    additionalSelect?: string[],
  ): Promise<ReturnUserDto> {
    let additionalColumns = null;
    if (additionalSelect) {
      additionalColumns = ',' + additionalSelect.join(', ');
    }

    let query = `
       SELECT
        User.id,
        firstName,
        lastName,
        profileImage,
        email,
        mobileNumber,
        User.genderId,
        User.createdAt,
        GenderTranslation.name AS gender,
        birthday
        ${additionalColumns ? additionalColumns : ''}
      FROM User
      LEFT JOIN Gender ON User.genderId = Gender.id
      LEFT JOIN GenderTranslation
      ON GenderTranslation.genderId = Gender.id
      AND GenderTranslation.language = ?
      WHERE ${whereColumn} = ?
      LIMIT 1
    `;

    // console.log(query);

    let theUser = await this.prisma.$queryRawUnsafe(
      query,
      I18nContext.current().lang,
      whereColumnValue,
    );

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
    await this.create({ ...reqBody, userType: AvailableRoles.Child });

    // let theChild = await this.getByMobileNumber(reqBody.mobileNumber);
    let theChild = await this.findBy(FIND_BY.MOBILE_NUMBER, reqBody.mobileNumber);

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

  private buildInsertQueryColumns(data: Partial<SignupUserDto>): {
    columns: string[];
    values: any[];
  } {
    const columns: string[] = [];
    const values: any[] = [];

    if (data.firstName) {
      columns.push('firstName');
      values.push(data.firstName);
    }
    if (data.lastName) {
      columns.push('lastName');
      values.push(data.lastName);
    }
    if (data.profileImage) {
      columns.push('profileImage');
      values.push(data.profileImage);
    }
    if (data.password) {
      columns.push('password');
      values.push(data.password);
    }
    if (data.email) {
      columns.push('email');
      values.push(data.email);
    }
    if (data.mobileNumber) {
      columns.push('mobileNumber');
      values.push(data.mobileNumber);
    }
    if (data.genderId) {
      columns.push('genderId');
      values.push(data.genderId);
    }
    if (data.birthday) {
      columns.push('birthday');
      values.push(new Date(data.birthday));
    }

    if (data.userType) {
      columns.push('userType');
      values.push(data.userType);
    } else {
      columns.push('userType');
      values.push(AvailableRoles.User);
    }

    return { columns, values };
  }
}
