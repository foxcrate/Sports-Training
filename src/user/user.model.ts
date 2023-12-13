import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReturnUserDto } from './dtos/return.dto';
import { SignupUserDto } from './dtos/signup.dto';
import { CompleteSignupUserDto } from './dtos/complete-signup.dto';
import { NativeUserDto } from './dtos/native.dto';
import { AvailableRoles } from 'src/auth/dtos/available-roles.dto';

@Injectable()
export class UserModel {
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
      u.gender AS gender,
      u.birthday AS birthday
      FROM ParentsChilds AS pc
      INNER JOIN User AS u
      ON pc.childId = u.id
      AND
      u.userType = 'child'
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
      gender,
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
      ${signupData.gender},
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

  async updatePassword(userId: number, hashedPassword: string) {
    //update
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
      id,
        firstName,
        lastName,
        profileImage,
        email,
        mobileNumber,
        gender,
        birthday
      FROM User
      WHERE id = ${userId}
      LIMIT 1
    `;
    return theUser[0];
  }

  async getByMobileNumber(mobileNumber): Promise<ReturnUserDto> {
    let theUser = await this.prisma.$queryRaw`
      SELECT
      id,
        firstName,
        lastName,
        profileImage,
        email,
        mobileNumber,
        gender,
        birthday
      FROM User
      WHERE mobileNumber = ${mobileNumber}
      LIMIT 1
    `;
    return theUser[0];
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
      id,
        firstName,
        lastName,
        profileImage,
        email,
        mobileNumber,
        gender,
        birthday
      FROM User
      WHERE email = ${email}
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
      isActivated,
      profileImage,
      email,
      mobileNumber,
      gender,
      birthday)
      VALUES
    (${reqBody.firstName},
    ${reqBody.lastName},
    ${AvailableRoles.Child},
    false,
    ${reqBody.profileImage},
    ${reqBody.email},
    ${reqBody.mobileNumber},
    ${reqBody.gender},
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
